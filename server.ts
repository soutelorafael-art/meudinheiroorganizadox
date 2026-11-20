import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { generateActivationCode } from './src/utils/licensing.ts';
import { DEFAULT_PIX_CONFIG } from './src/utils/pix.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ReceiptVerificationResult {
  isPixReceipt: boolean;
  isCompleted: boolean;
  amount: number;
  pixKeyOrRecipientValid: boolean;
  payerName?: string;
  reason: string;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '12mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Verify attached Pix receipt (image or PDF) and automatically issue an activation code
  app.post('/api/verify-pix-receipt', async (req, res) => {
    try {
      const { fileData, mimeType, expectedPixKey } = req.body as {
        fileData?: string;
        mimeType?: string;
        expectedPixKey?: string;
      };

      if (!fileData || typeof fileData !== 'string' || !mimeType || typeof mimeType !== 'string') {
        res.status(400).json({
          approved: false,
          error: 'Envie uma imagem ou PDF do comprovante Pix para validação.',
        });
        return;
      }

      const normalizedMime = mimeType.toLowerCase().trim();
      if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
        res.status(400).json({
          approved: false,
          error: 'Formato não suportado. Envie uma imagem (JPG, PNG, WEBP) ou PDF do comprovante.',
        });
        return;
      }

      // Strip optional data URL prefix if sent
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      if (!base64Data || base64Data.length > 11_000_000) {
        res.status(400).json({
          approved: false,
          error: 'Arquivo muito grande. Envie um print ou PDF de até 8 MB.',
        });
        return;
      }

      const targetPixKey = (expectedPixKey || DEFAULT_PIX_CONFIG.pixKey).trim();
      const ai = getGeminiClient();

      const prompt = [
        'Você é um verificador de comprovantes de pagamento Pix do Brasil para o aplicativo "Meu Dinheiro Organizado".',
        `O valor esperado do pagamento é R$ ${DEFAULT_PIX_CONFIG.amount.toFixed(2).replace('.', ',')} (mínimo R$ 5,00).`,
        `A chave Pix oficial de destino é: ${targetPixKey}.`,
        '',
        'Analise cuidadosamente o documento/imagem anexado e responda em JSON estruturado seguindo estas regras:',
        '1. isPixReceipt: true SOMENTE se for um comprovante real de transferência/pagamento Pix de banco ou carteira digital brasileira (ex.: Nubank, Itaú, Bradesco, Santander, Banco do Brasil, Caixa, Inter, PicPay, Mercado Pago, PagBank, C6, Sicredi, etc.). Fotos aleatórias, prints da própria tela de QR Code/pagamento antes de pagar, memes, recibos de outro assunto ou imagens ilegíveis devem retornar false.',
        '2. isCompleted: true SOMENTE se o comprovante indicar pagamento efetivado/concluído/enviado (ex.: "Comprovante", "Pix enviado", "Pagamento realizado", "Transferência concluída", "Autenticação", ID de transação E...). Se estiver "Agendado", "Pendente", "Cancelado", "Recusado" ou for apenas tela de confirmação antes de digitar senha, retorne false.',
        '3. amount: extraia o valor numérico pago em reais (ex.: 5.00 para "R$ 5,00"). Se não for possível ler o valor, retorne 0.',
        '4. pixKeyOrRecipientValid: verifique o destinatário/chave Pix no comprovante. IMPORTANTE: muitos bancos brasileiros ocultam ou não imprimem a chave Pix aleatória no comprovante (mostrando apenas o nome do titular ou chave parcialmente mascarada). Portanto:',
        `   - Se a chave Pix completa ou parcial aparecer no comprovante e coincidir com "${targetPixKey}", retorne true.`,
        '   - Se a chave Pix NÃO aparecer ou estiver mascarada, retorne true desde que o destinatário seja uma pessoa física (ex.: Rafael / Soutelo) ou "Meu Dinheiro Organizado" e NÃO seja claramente um estabelecimento comercial não relacionado (como supermercado, posto de gasolina, boleto de energia, etc.).',
        '   - Se uma chave Pix visível for claramente DIFERENTE da chave oficial (por exemplo, outro CPF/CNPJ/e-mail/telefone totalmente diferente), retorne false.',
        '5. payerName: nome do pagador se estiver legível no comprovante, ou string vazia.',
        '6. reason: escreva uma frase curta e clara em português explicando o resultado para o usuário.',
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: normalizedMime === 'image/jpg' ? 'image/jpeg' : normalizedMime,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isPixReceipt: {
                type: Type.BOOLEAN,
                description: 'Indica se o anexo é um comprovante real de pagamento Pix.',
              },
              isCompleted: {
                type: Type.BOOLEAN,
                description: 'Indica se o Pix foi concluído/enviado (não pendente nem agendado).',
              },
              amount: {
                type: Type.NUMBER,
                description: 'Valor pago em reais (BRL), por exemplo 5.0.',
              },
              pixKeyOrRecipientValid: {
                type: Type.BOOLEAN,
                description: 'Indica se a chave Pix ou destinatário é compatível.',
              },
              payerName: {
                type: Type.STRING,
                description: 'Nome do pagador se visível.',
              },
              reason: {
                type: Type.STRING,
                description: 'Mensagem objetiva em português explicando o resultado da verificação.',
              },
            },
            required: [
              'isPixReceipt',
              'isCompleted',
              'amount',
              'pixKeyOrRecipientValid',
              'reason',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          approved: false,
          error: 'Não foi possível ler o comprovante. Tente enviar um print mais nítido.',
        });
        return;
      }

      const parsed = JSON.parse(rawText) as ReceiptVerificationResult;
      const numericAmount = Number(parsed.amount) || 0;
      const meetsMinimumAmount = numericAmount >= 4.99;

      const approved =
        Boolean(parsed.isPixReceipt) &&
        Boolean(parsed.isCompleted) &&
        meetsMinimumAmount &&
        Boolean(parsed.pixKeyOrRecipientValid);

      if (approved) {
        const activationCode = generateActivationCode();
        res.json({
          approved: true,
          activationCode,
          amount: numericAmount,
          payerName: parsed.payerName || '',
          reason:
            parsed.reason ||
            'Comprovante Pix de R$ 5,00 confirmado! Todo o sistema foi liberado na palma da sua mão.',
        });
        return;
      }

      let fallbackReason = parsed.reason;
      if (!fallbackReason) {
        if (!parsed.isPixReceipt) {
          fallbackReason = 'O arquivo enviado não parece ser um comprovante de pagamento Pix.';
        } else if (!parsed.isCompleted) {
          fallbackReason = 'O comprovante precisa mostrar um Pix já concluído/enviado.';
        } else if (!meetsMinimumAmount) {
          fallbackReason = `Valor identificado (R$ ${numericAmount.toFixed(2).replace('.', ',')}) é menor que R$ 5,00.`;
        } else {
          fallbackReason = 'A chave Pix de destino no comprovante não corresponde à chave oficial.';
        }
      }

      res.json({
        approved: false,
        amount: numericAmount,
        reason: fallbackReason,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Pix receipt verification error:', message);

      if (message === 'GEMINI_API_KEY_MISSING') {
        res.status(503).json({
          approved: false,
          error: 'Serviço de validação automática indisponível no momento. Use a aba "Já tenho código" ou tente novamente.',
        });
        return;
      }

      res.status(500).json({
        approved: false,
        error: 'Erro ao analisar o comprovante. Verifique sua conexão e tente novamente.',
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meu Dinheiro Organizado rodando na porta ${PORT}`);
  });
}

startServer();
