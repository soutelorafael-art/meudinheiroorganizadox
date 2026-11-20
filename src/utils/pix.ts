// Banco Central do Brasil — BR Code (EMV QRCPS-MPM) Static Pix Payload Generator

export const DEFAULT_PIX_CONFIG = {
  pixKey: '5484b5c2-9e78-4d38-962d-4e87571d68a2',
  merchantName: 'MEU DINHEIRO ORGANIZADO',
  merchantCity: 'BRASIL',
  amount: 5.0,
  description: 'Acesso App MDO',
  txId: 'MDOAPP500',
};

function sanitizeAscii(input: string, maxLen: number): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 \-./]/g, '')
    .trim()
    .slice(0, maxLen);
}

function formatTLV(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Computes CRC-16/CCITT-FALSE (polynomial 0x1021, initial value 0xFFFF)
 * required in field 63 of the Pix BR Code specification.
 */
function crc16CCITT(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadOptions {
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  description?: string;
  txId?: string;
}

export function generatePixBrCode(options: PixPayloadOptions = {}): string {
  const pixKey = (options.pixKey || DEFAULT_PIX_CONFIG.pixKey).trim();
  const merchantName = sanitizeAscii(
    options.merchantName || DEFAULT_PIX_CONFIG.merchantName,
    25
  ).toUpperCase() || 'MEU DINHEIRO';
  const merchantCity = sanitizeAscii(
    options.merchantCity || DEFAULT_PIX_CONFIG.merchantCity,
    15
  ).toUpperCase() || 'BRASIL';
  const amount = options.amount ?? DEFAULT_PIX_CONFIG.amount;
  const description = sanitizeAscii(options.description || DEFAULT_PIX_CONFIG.description, 25);
  const txId =
    (options.txId || DEFAULT_PIX_CONFIG.txId).replace(/[^A-Za-z0-9]/g, '').slice(0, 25) ||
    'MDOAPP500';

  // Field 26: Merchant Account Information (GUI + Key + optional Description)
  let merchantAccountInfo = formatTLV('00', 'br.gov.bcb.pix') + formatTLV('01', pixKey);
  if (description && merchantAccountInfo.length + description.length + 4 <= 99) {
    merchantAccountInfo += formatTLV('02', description);
  }

  const parts: string[] = [
    formatTLV('00', '01'), // Payload Format Indicator
    formatTLV('26', merchantAccountInfo), // Merchant Account Information
    formatTLV('52', '0000'), // Merchant Category Code
    formatTLV('53', '986'), // Currency (BRL)
  ];

  if (amount > 0) {
    parts.push(formatTLV('54', amount.toFixed(2)));
  }

  parts.push(
    formatTLV('58', 'BR'), // Country Code
    formatTLV('59', merchantName), // Merchant Name
    formatTLV('60', merchantCity), // Merchant City
    formatTLV('62', formatTLV('05', txId)) // Additional Data Field (TXID)
  );

  const payloadWithoutCrc = `${parts.join('')}6304`;
  const crc = crc16CCITT(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
}
