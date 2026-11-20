// Local Activation License & Owner Code Generator (100% offline-capable, no backend required)

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes 0, O, 1, I to avoid typing confusion
const LICENSE_STORAGE_KEY = 'mdo_license_v1';
const OWNER_HISTORY_KEY = 'mdo_owner_codes_v1';
const OWNER_CONFIG_KEY = 'mdo_owner_config_v1';
const LICENSE_SALT = 'MDO-5484B5C2-PIX500-2026';

export const DEFAULT_OWNER_PIN = '271086';

export interface LicenseState {
  isActivated: boolean;
  code?: string;
  activatedAt?: string;
  mode: 'full' | 'demo';
}

export interface IssuedCodeRecord {
  id: string;
  code: string;
  buyerName: string;
  createdAt: string;
  note?: string;
}

export interface OwnerSalesConfig {
  pin: string;
  whatsapp: string; // Digits only with country code e.g. 5511999999999
  merchantName: string;
  merchantCity: string;
}

function hashToken(input: string): string {
  // Deterministic 32-bit FNV-1a dual-pass hash mapped into ALPHABET (4 chars)
  let h1 = 0x811c9dc5;
  let h2 = 0x27d4eb2d;
  const full = `${LICENSE_SALT}:${input.toUpperCase()}`;
  for (let i = 0; i < full.length; i++) {
    const ch = full.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= (ch + i * 31) & 0xff;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }

  const combined = [
    h1 & 31,
    (h1 >>> 5) & 31,
    (h1 >>> 10) & 31,
    (h2 >>> 3) & 31,
  ];

  return combined.map(idx => ALPHABET[idx % ALPHABET.length]).join('');
}

export function normalizeCode(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^MDO/, '');
  if (cleaned.length !== 8) return raw.trim().toUpperCase();
  return `MDO-${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
}

export function generateActivationCode(): string {
  let seed = '';
  for (let i = 0; i < 4; i++) {
    seed += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  const sig = hashToken(seed);
  return `MDO-${seed}-${sig}`;
}

export function verifyActivationCode(rawCode: string): boolean {
  const formatted = normalizeCode(rawCode);
  const match = /^MDO-([A-Z2-9]{4})-([A-Z2-9]{4})$/.exec(formatted);
  if (!match) return false;
  const [, seed, sig] = match;
  return hashToken(seed) === sig;
}

export function loadLicenseState(): LicenseState {
  try {
    const saved = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LicenseState;
      if (parsed.isActivated && parsed.code && verifyActivationCode(parsed.code)) {
        return { ...parsed, isActivated: true, mode: 'full' };
      }
    }
  } catch {
    // ignore storage errors
  }
  return { isActivated: false, mode: 'demo' };
}

export function saveActivatedLicense(code: string): LicenseState {
  const normalized = normalizeCode(code);
  const state: LicenseState = {
    isActivated: true,
    code: normalized,
    activatedAt: new Date().toISOString(),
    mode: 'full',
  };
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  return state;
}

export function clearActivatedLicense(): LicenseState {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  } catch {
    // ignore
  }
  return { isActivated: false, mode: 'demo' };
}

export function loadIssuedCodes(): IssuedCodeRecord[] {
  try {
    const saved = localStorage.getItem(OWNER_HISTORY_KEY);
    if (saved) return JSON.parse(saved) as IssuedCodeRecord[];
  } catch {
    // ignore
  }
  return [];
}

export function saveIssuedCodes(records: IssuedCodeRecord[]): void {
  try {
    localStorage.setItem(OWNER_HISTORY_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function loadOwnerConfig(): OwnerSalesConfig {
  try {
    const saved = localStorage.getItem(OWNER_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<OwnerSalesConfig>;
      const resolvedPin =
        !parsed.pin || parsed.pin === '5000' ? DEFAULT_OWNER_PIN : parsed.pin;
      return {
        pin: resolvedPin,
        whatsapp: parsed.whatsapp || '',
        merchantName: parsed.merchantName || 'MEU DINHEIRO ORGANIZADO',
        merchantCity: parsed.merchantCity || 'BRASIL',
      };
    }
  } catch {
    // ignore
  }
  return {
    pin: DEFAULT_OWNER_PIN,
    whatsapp: '',
    merchantName: 'MEU DINHEIRO ORGANIZADO',
    merchantCity: 'BRASIL',
  };
}

export function saveOwnerConfig(config: OwnerSalesConfig): void {
  try {
    localStorage.setItem(OWNER_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function buildActivationUrl(code: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?ativar=${encodeURIComponent(normalizeCode(code))}`;
}

export function buildWhatsAppDeliveryMessage(code: string, buyerName?: string): string {
  const normalized = normalizeCode(code);
  const url = buildActivationUrl(normalized);
  const greeting = buyerName?.trim() ? `Olá, ${buyerName.trim()}!` : 'Olá!';
  return [
    `${greeting} Obrigado pela compra do *Meu Dinheiro Organizado*!`,
    '',
    `Seu código de ativação: *${normalized}*`,
    '',
    `Toque no link abaixo no celular para desbloquear automaticamente:`,
    url,
    '',
    `Dica: depois de abrir no Chrome (Android) ou Safari (iPhone), adicione à Tela Inicial para usar em tela cheia e offline.`,
  ].join('\n');
}
