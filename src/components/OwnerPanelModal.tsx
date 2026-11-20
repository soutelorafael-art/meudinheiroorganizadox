import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Unlock,
  Lock,
  Share2,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react';
import {
  LicenseState,
  IssuedCodeRecord,
  OwnerSalesConfig,
  generateActivationCode,
  loadIssuedCodes,
  saveIssuedCodes,
  loadOwnerConfig,
  saveOwnerConfig,
  buildActivationUrl,
  buildWhatsAppDeliveryMessage,
} from '../utils/licensing';
import { DEFAULT_PIX_CONFIG } from '../utils/pix';
import { playSuccessSound, playTapSound } from '../utils/sound';

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: LicenseState;
  onActivateThisDevice: (code: string) => void;
  onResetThisDeviceToDemo: () => void;
  soundEnabled: boolean;
}

export const OwnerPanelModal: React.FC<OwnerPanelModalProps> = ({
  isOpen,
  onClose,
  license,
  onActivateThisDevice,
  onResetThisDeviceToDemo,
  soundEnabled,
}) => {
  const [ownerConfig, setOwnerConfig] = useState<OwnerSalesConfig>(() => loadOwnerConfig());
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [tab, setTab] = useState<'codes' | 'promo' | 'config'>('codes');
  const [buyerName, setBuyerName] = useState('');
  const [issuedCodes, setIssuedCodes] = useState<IssuedCodeRecord[]>(() => loadIssuedCodes());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Config form fields
  const [whatsappInput, setWhatsappInput] = useState(ownerConfig.whatsapp);
  const [merchantNameInput, setMerchantNameInput] = useState(ownerConfig.merchantName);
  const [merchantCityInput, setMerchantCityInput] = useState(ownerConfig.merchantCity);
  const [newPinInput, setNewPinInput] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = loadOwnerConfig();
      setOwnerConfig(cfg);
      setWhatsappInput(cfg.whatsapp);
      setMerchantNameInput(cfg.merchantName);
      setMerchantCityInput(cfg.merchantCity);
      setIssuedCodes(loadIssuedCodes());
    } else {
      setPinInput('');
      setPinError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, id: string) => {
    playTapSound(soundEnabled);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      playSuccessSound(soundEnabled);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // ignore
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound(soundEnabled);
    if (pinInput.trim() === ownerConfig.pin) {
      setIsUnlocked(true);
      setPinError(null);
      playSuccessSound(soundEnabled);
    } else {
      setPinError('PIN incorreto. Tente novamente.');
    }
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound(soundEnabled);
    const code = generateActivationCode();
    const record: IssuedCodeRecord = {
      id: `code_${Date.now()}`,
      code,
      buyerName: buyerName.trim() || 'Cliente Pix R$ 5,00',
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...issuedCodes];
    setIssuedCodes(updated);
    saveIssuedCodes(updated);
    setBuyerName('');
  };

  const handleDeleteRecord = (id: string) => {
    playTapSound(soundEnabled);
    const updated = issuedCodes.filter(item => item.id !== id);
    setIssuedCodes(updated);
    saveIssuedCodes(updated);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound(soundEnabled);
    const updated: OwnerSalesConfig = {
      pin: newPinInput.trim().length >= 4 ? newPinInput.trim() : ownerConfig.pin,
      whatsapp: whatsappInput.replace(/\D/g, ''),
      merchantName: merchantNameInput.trim() || 'MEU DINHEIRO ORGANIZADO',
      merchantCity: merchantCityInput.trim() || 'BRASIL',
    };
    saveOwnerConfig(updated);
    setOwnerConfig(updated);
    setNewPinInput('');
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const whatsappSalesCopy = [
    'Organize seu dinheiro direto no celular (Android e iPhone) sem pagar mensalidade!',
    '',
    'Com o Meu Dinheiro Organizado você controla:',
    '- Painel do mês e resumo anual completo',
    '- Entradas, despesas e cartões de crédito',
    '- Regra 50-30-20 e reserva de emergência',
    '- Funciona offline e com modo privacidade',
    '',
    'O pagamento único de R$ 5,00 no Pix já libera todo o sistema na palma da sua mão — sem mensalidade!',
    `Acesse e teste agora: ${appUrl}`,
  ].join('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 dark:bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Área do Criador · Vendas R$ 5,00</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Gerador de códigos e gestão local</p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            aria-label="Fechar"
            className="min-w-[40px] min-h-[40px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isUnlocked ? (
          /* Owner PIN Unlock Form */
          <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digite o PIN do Criador</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Acesso exclusivo para gerar códigos de ativação de R$ 5,00 e configurar seu Pix.
              </p>
            </div>

            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                if (pinError) setPinError(null);
              }}
              placeholder="Digite seu PIN"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-none text-center font-mono text-base tracking-[0.35em] text-slate-900 dark:text-white"
            />

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition active:scale-[0.98]"
            >
              Entrar no Painel
            </button>
          </form>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-4 pt-3 shrink-0">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setTab('codes');
                  }}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition ${
                    tab === 'codes'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Códigos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setTab('promo');
                  }}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition ${
                    tab === 'promo'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Divulgar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setTab('config');
                  }}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition ${
                    tab === 'config'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ajustes
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {tab === 'codes' && (
                <>
                  {/* This Device License Toggle */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Este aparelho: {license.isActivated ? 'Ativado (Completo)' : 'Modo Demonstração'}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {license.isActivated
                          ? `Código: ${license.code}`
                          : 'Libere este aparelho ou teste a visão do cliente'}
                      </p>
                    </div>
                    {license.isActivated ? (
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound(soundEnabled);
                          onResetThisDeviceToDemo();
                        }}
                        className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Ver Demo</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          playSuccessSound(soundEnabled);
                          onActivateThisDevice(generateActivationCode());
                        }}
                        className="min-h-[38px] px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Liberar</span>
                      </button>
                    )}
                  </div>

                  {/* Generate New Code for a Buyer */}
                  <form onSubmit={handleGenerateCode} className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Gerar código para novo comprador (Pix R$ 5,00)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        placeholder="Nome do cliente (opcional)"
                        className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        className="h-11 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Gerar</span>
                      </button>
                    </div>
                  </form>

                  {/* Issued Codes List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Códigos emitidos ({issuedCodes.length})</span>
                      <span>Toque para copiar entrega</span>
                    </div>

                    {issuedCodes.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                        Nenhum código gerado ainda. Assim que receber um Pix de R$ 5,00, clique em <strong className="text-slate-700 dark:text-slate-300">Gerar</strong> acima.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {issuedCodes.map(rec => (
                          <div
                            key={rec.id}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                                  {rec.code}
                                </p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                  {rec.buyerName} · {new Date(rec.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(rec.id)}
                                aria-label="Remover do histórico"
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    buildWhatsAppDeliveryMessage(rec.code, rec.buyerName),
                                    `msg_${rec.id}`
                                  )
                                }
                                className="min-h-[38px] px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                              >
                                {copiedId === `msg_${rec.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Mensagem copiada</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Copiar entrega</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(buildActivationUrl(rec.code), `url_${rec.id}`)
                                }
                                className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                              >
                                {copiedId === `url_${rec.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Link copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Link 1-toque</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'promo' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Chave Pix configurada</p>
                    <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 break-all">
                      {DEFAULT_PIX_CONFIG.pixKey}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Valor fixo no QR Code: <span className="font-mono text-slate-900 dark:text-white font-semibold">R$ 5,00</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Texto pronto para divulgar no WhatsApp / Instagram:
                    </p>
                    <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {whatsappSalesCopy}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(whatsappSalesCopy, 'promo_copy')}
                      className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      {copiedId === 'promo_copy' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Texto de divulgação copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar texto de divulgação</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'config' && (
                <form onSubmit={handleSaveConfig} className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Personalização das vendas (salvo neste aparelho)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400">
                      Seu WhatsApp para receber comprovantes (com DDD, ex: 5511999999999)
                    </label>
                    <input
                      type="tel"
                      value={whatsappInput}
                      onChange={e => setWhatsappInput(e.target.value)}
                      placeholder="5511999999999"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400">Nome exibido no Pix</label>
                    <input
                      type="text"
                      value={merchantNameInput}
                      onChange={e => setMerchantNameInput(e.target.value)}
                      maxLength={25}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400">Cidade no Pix</label>
                    <input
                      type="text"
                      value={merchantCityInput}
                      onChange={e => setMerchantCityInput(e.target.value)}
                      maxLength={15}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400">
                      Alterar PIN do Criador (mínimo 4 dígitos)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={newPinInput}
                      onChange={e => setNewPinInput(e.target.value)}
                      placeholder="Deixe vazio para manter o atual"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  {configSaved && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Configurações salvas com sucesso!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    Salvar Configurações
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
