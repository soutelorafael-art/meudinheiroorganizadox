import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  KeyRound,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Upload,
  FileText,
  Loader2,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import QRCode from 'qrcode';
import { DEFAULT_PIX_CONFIG, generatePixBrCode } from '../utils/pix';
import {
  normalizeCode,
  verifyActivationCode,
  loadOwnerConfig,
} from '../utils/licensing';
import { playSuccessSound, playTapSound } from '../utils/sound';

interface ActivationGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (code: string) => void;
  onOpenOwnerPanel: () => void;
  soundEnabled: boolean;
  reason?: string | null;
}

/**
 * Compresses large mobile camera/screenshot images before upload so receipt
 * validation completes quickly even over 4G mobile connections.
 */
async function prepareReceiptFile(
  file: File
): Promise<{ dataUrl: string; mimeType: string }> {
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          dataUrl: String(reader.result || ''),
          mimeType: 'application/pdf',
        });
      reader.onerror = () => reject(new Error('Não foi possível ler o PDF.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () =>
        resolve({
          dataUrl: rawDataUrl,
          mimeType: file.type || 'image/jpeg',
        });
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            mimeType: file.type || 'image/jpeg',
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          dataUrl: compressed,
          mimeType: 'image/jpeg',
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const ActivationGateModal: React.FC<ActivationGateModalProps> = ({
  isOpen,
  onClose,
  onActivate,
  onOpenOwnerPanel,
  soundEnabled,
  reason,
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'code'>('pix');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'brcode' | 'key' | null>(null);

  // Receipt upload & auto-verification state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [receiptFile, setReceiptFile] = useState<{
    name: string;
    mimeType: string;
    dataUrl: string;
    isPdf: boolean;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState<string | null>(null);

  // Manual activation code state
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [justActivated, setJustActivated] = useState(false);

  const ownerConfig = useMemo(() => loadOwnerConfig(), [isOpen]);

  const pixBrCode = useMemo(
    () =>
      generatePixBrCode({
        pixKey: DEFAULT_PIX_CONFIG.pixKey,
        merchantName: ownerConfig.merchantName,
        merchantCity: ownerConfig.merchantCity,
        amount: DEFAULT_PIX_CONFIG.amount,
      }),
    [ownerConfig.merchantName, ownerConfig.merchantCity]
  );

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(pixBrCode, {
      width: 240,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code Pix:', err));
  }, [isOpen, pixBrCode]);

  if (!isOpen) return null;

  const copyText = async (text: string, type: 'brcode' | 'key') => {
    playTapSound(soundEnabled);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedType(type);
      playSuccessSound(soundEnabled);
      setTimeout(() => setCopiedType(null), 3000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSelectReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setReceiptError(null);
    setReceiptSuccessMsg(null);

    if (file.size > 10 * 1024 * 1024) {
      setReceiptError('O arquivo é muito grande (máximo 10 MB). Envie um print da tela do comprovante.');
      return;
    }

    try {
      playTapSound(soundEnabled);
      const prepared = await prepareReceiptFile(file);
      setReceiptFile({
        name: file.name,
        mimeType: prepared.mimeType,
        dataUrl: prepared.dataUrl,
        isPdf: prepared.mimeType === 'application/pdf',
      });
    } catch {
      setReceiptError('Não foi possível carregar este arquivo. Tente enviar uma imagem ou PDF.');
    }
  };

  const handleVerifyReceipt = async () => {
    if (!receiptFile || isVerifying) return;
    playTapSound(soundEnabled);
    setIsVerifying(true);
    setReceiptError(null);
    setReceiptSuccessMsg(null);

    try {
      const response = await fetch('/api/verify-pix-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: receiptFile.dataUrl,
          mimeType: receiptFile.mimeType,
          expectedPixKey: DEFAULT_PIX_CONFIG.pixKey,
        }),
      });

      const data = (await response.json()) as {
        approved?: boolean;
        activationCode?: string;
        reason?: string;
        error?: string;
      };

      if (!response.ok) {
        setReceiptError(
          data.error || 'Não foi possível verificar o comprovante agora. Tente novamente.'
        );
        setIsVerifying(false);
        return;
      }

      if (data.approved && data.activationCode && verifyActivationCode(data.activationCode)) {
        playSuccessSound(soundEnabled);
        setReceiptSuccessMsg(
          data.reason ||
            'Comprovante de R$ 5,00 confirmado! Todo o sistema foi liberado na palma da sua mão.'
        );
        setTimeout(() => {
          onActivate(data.activationCode!);
          setReceiptFile(null);
          setReceiptSuccessMsg(null);
          setIsVerifying(false);
          onClose();
        }, 1200);
        return;
      }

      setReceiptError(
        data.reason ||
          'Comprovante não validado. Certifique-se de anexar o comprovante concluído de R$ 5,00 no Pix.'
      );
      setIsVerifying(false);
    } catch {
      setReceiptError(
        'Sem conexão para validar o comprovante agora. Verifique sua internet e tente novamente.'
      );
      setIsVerifying(false);
    }
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound(soundEnabled);
    const normalized = normalizeCode(codeInput);

    if (!verifyActivationCode(normalized)) {
      setCodeError('Código inválido. Confira os caracteres ou anexe seu comprovante Pix.');
      return;
    }

    setCodeError(null);
    setJustActivated(true);
    playSuccessSound(soundEnabled);
    setTimeout(() => {
      onActivate(normalized);
      setJustActivated(false);
      setCodeInput('');
      onClose();
    }, 900);
  };

  const whatsappReceiptHref = ownerConfig.whatsapp
    ? `https://wa.me/${ownerConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        'Olá! Fiz o Pix de R$ 5,00 para o app Meu Dinheiro Organizado e preciso de ajuda com a ativação.'
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 dark:bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="Meu Dinheiro Organizado"
              className="w-11 h-11 rounded-2xl border border-emerald-500/30 shrink-0"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                Ativar Acesso Completo
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
                Pagamento único de R$ 5,00 já libera todo o sistema na palma da mão
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            aria-label="Fechar"
            className="min-w-[40px] min-h-[40px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional contextual notice when triggered from a locked action */}
        {reason && (
          <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 shrink-0">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{reason}</span>
          </div>
        )}

        {/* Segmented Control */}
        <div className="px-5 pt-4 shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                playTapSound(soundEnabled);
                setActiveTab('pix');
              }}
              className={`min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'pix'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Pix R$ 5,00 + Liberar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound(soundEnabled);
                setActiveTab('code');
              }}
              className={`min-h-[42px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Tenho um código</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'pix' ? (
            <>
              {/* Price & Benefits Summary */}
              <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pagamento único · Sem mensalidade</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                        R$ 5,00
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">via Pix</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">Liberação imediata</p>
                    <p>9 módulos · Android &amp; iPhone</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-xl px-3 py-2 leading-relaxed">
                  Faça o Pix de <strong className="text-emerald-950 dark:text-white">R$ 5,00</strong> e anexe o comprovante abaixo para <strong className="text-emerald-950 dark:text-white">liberar todo o sistema na hora, na palma da sua mão</strong>.
                </p>
              </div>

              {/* STEP 1: Pay via Pix */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  1. Pague R$ 5,00 no Pix
                </p>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="p-2 bg-white rounded-xl shrink-0 border border-slate-200 dark:border-transparent">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Pix R$ 5,00"
                        className="w-24 h-24 block"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-slate-500 text-[10px]">
                        Gerando...
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <button
                      type="button"
                      onClick={() => copyText(pixBrCode, 'brcode')}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                    >
                      {copiedType === 'brcode' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Pix Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Pix Copia e Cola</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyText(DEFAULT_PIX_CONFIG.pixKey, 'key')}
                      className="w-full min-h-[38px] px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {copiedType === 'key' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Chave Copiada</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Copiar chave Pix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 2: Attach Pix Receipt & Instant Automatic Unlock */}
              <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    2. Anexe o comprovante para liberar na hora
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Envie o print da tela ou PDF do comprovante Pix. A liberação é automática.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleSelectReceipt}
                  className="hidden"
                />

                {!receiptFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      fileInputRef.current?.click();
                    }}
                    className="w-full min-h-[96px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50/50 dark:hover:bg-slate-950/70 border border-dashed border-emerald-400 dark:border-emerald-500/50 hover:border-emerald-500 dark:hover:border-emerald-400 transition flex flex-col items-center justify-center gap-2 text-center active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Toque para anexar o comprovante Pix
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Aceita print de tela (JPG, PNG) ou PDF do banco
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      {receiptFile.isPdf ? (
                        <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-500/30">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={receiptFile.dataUrl}
                          alt="Prévia do comprovante Pix"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {receiptFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Comprovante anexado · Pronto para validar
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => {
                          playTapSound(soundEnabled);
                          fileInputRef.current?.click();
                        }}
                        aria-label="Trocar comprovante"
                        className="min-w-[38px] min-h-[38px] rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyReceipt}
                      disabled={isVerifying || Boolean(receiptSuccessMsg)}
                      className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Validando comprovante Pix...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Validar Comprovante e Liberar Agora</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {receiptError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{receiptError}</span>
                  </div>
                )}

                {receiptSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{receiptSuccessMsg}</span>
                  </div>
                )}

                {whatsappReceiptHref && (
                  <a
                    href={whatsappReceiptHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[42px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/80 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Precisa de ajuda? Falar no WhatsApp</span>
                  </a>
                )}
              </div>
            </>
          ) : (
            /* Manual Activation Code Input Tab */
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digite seu código de ativação</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Se você já recebeu um código no formato{' '}
                  <span className="font-mono text-slate-800 dark:text-slate-200">MDO-XXXX-XXXX</span>, digite abaixo para liberar.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="activation-code" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Código de acesso
                </label>
                <input
                  id="activation-code"
                  type="text"
                  value={codeInput}
                  onChange={e => {
                    setCodeInput(e.target.value.toUpperCase());
                    if (codeError) setCodeError(null);
                  }}
                  placeholder="MDO-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-none text-center font-mono text-base font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              {codeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              {justActivated && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Acesso completo desbloqueado com sucesso!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!codeInput.trim() || justActivated}
                className="w-full min-h-[48px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ativar Aplicativo Agora</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 pb-safe">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition min-h-[40px] px-2"
          >
            Continuar na demonstração
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenOwnerPanel();
            }}
            className="text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition min-h-[40px] px-2"
          >
            Área do criador
          </button>
        </div>
      </div>
    </div>
  );
};
