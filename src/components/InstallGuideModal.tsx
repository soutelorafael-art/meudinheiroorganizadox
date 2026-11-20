import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Share2,
  PlusSquare,
  Download,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ShieldCheck,
  WifiOff,
  MoreVertical,
  Send,
  AlertTriangle,
  Zap,
  Monitor,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playSuccessSound, playTapSound } from '../utils/sound';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isIOSSafari,
    platform,
    canWebShare,
    install,
    shareApp,
  } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios' | 'qrcode'>('desktop');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Auto-select the most relevant tab for the user's device
  useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else if (isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isIOS, isAndroid]);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
  }, [appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    playTapSound(soundEnabled);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      playSuccessSound(soundEnabled);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleShare = async () => {
    playTapSound(soundEnabled);
    if (canWebShare) {
      const ok = await shareApp();
      if (ok) {
        playSuccessSound(soundEnabled);
        return;
      }
    }
    await handleCopyLink();
  };

  const handleNativeInstall = async () => {
    playTapSound(soundEnabled);
    const accepted = await install();
    if (accepted) {
      playSuccessSound(soundEnabled);
    }
  };

  const platformBadgeLabel =
    platform === 'android'
      ? 'Android detectado'
      : platform === 'ios'
      ? 'iPhone / iPad detectado'
      : 'Computador (PC / Mac) detectado';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-white to-white dark:from-emerald-950/70 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="Ícone Meu Dinheiro Organizado"
              className="w-11 h-11 rounded-2xl shadow-md border border-emerald-400/30 shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>App para PC, Android &amp; iPhone</span>
              </h2>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
                {platformBadgeLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct 1-Tap Install Banner (Android Chrome / Desktop Chromium) */}
        {isInstallable && !isInstalled && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/15 border-b border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-2.5">
            <div className="text-xs">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Instalação Rápida Disponível!</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-100/80 mt-0.5">
                Instale o ícone oficial com 1 clique no seu aparelho
              </p>
            </div>
            <button
              onClick={handleNativeInstall}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/15 border-b border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Você já está usando o aplicativo instalado em modo nativo!</span>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('desktop');
            }}
            className={`py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
              activeTab === 'desktop'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC</span>
          </button>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('android');
            }}
            className={`py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
              activeTab === 'android'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Android</span>
          </button>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('ios');
            }}
            className={`py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
              activeTab === 'ios'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>iPhone</span>
          </button>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('qrcode');
            }}
            className={`py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
              activeTab === 'qrcode'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 0: COMPUTADOR (PC / MAC) */}
          {activeTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-200">
                <strong className="text-emerald-900 dark:text-emerald-300">Computador (Windows / Mac):</strong> use direto no navegador em tela cheia ou instale como programa na área de trabalho.
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Abra no Google Chrome ou Microsoft Edge</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      O sistema já se adapta automaticamente com menu lateral completo e gráficos em tela larga.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Clique no ícone de Instalar na barra de endereço</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      No canto direito da barra de endereço (onde fica o site), clique em <strong>Instalar Meu Dinheiro Organizado</strong> ou use o botão verde acima.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Pronto! Ícone na Área de Trabalho</p>
                    <p className="text-emerald-700 dark:text-emerald-200/80 text-[11px] mt-0.5">
                      Abre em janela própria no PC, funciona offline e você pode exportar backup JSON para transferir entre PC e celular.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                <span>
                  <strong className="text-emerald-900 dark:text-emerald-300">Android (Chrome / Samsung):</strong> instala com ícone adaptativo e atalhos rápidos.
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Abra este endereço no Google Chrome</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Se estiver no computador, escaneie o <strong>QR Code</strong> ou copie o link abaixo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Toque nos 3 pontinhos (⋮) no topo direito</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Ou clique no botão verde <strong>"Instalar"</strong> caso apareça automaticamente no topo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Toque em "Instalar aplicativo"</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      (ou <strong>"Adicionar à tela inicial"</strong>) e confirme tocando em <strong>Instalar</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Pronto! App instalado no Android</p>
                    <p className="text-emerald-700 dark:text-emerald-200/80 text-[11px] mt-0.5">
                      Abre em tela cheia sem barra do navegador, vibra nos toques e funciona mesmo offline!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IPHONE / IOS */}
          {activeTab === 'ios' && (
            <div className="space-y-3 animate-in fade-in">
              {isIOS && !isIOSSafari ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 dark:text-amber-300">Abra este link no Safari</p>
                    <p className="text-[11px] mt-0.5">
                      Você está usando outro navegador no iPhone. Copie o link abaixo e cole no <strong>Safari</strong> para liberar a instalação na Tela de Início.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-800 dark:text-blue-200">
                  <strong className="text-blue-900 dark:text-blue-300">iPhone / iPad (Safari):</strong> compatível com tela cheia, área segura da Dynamic Island e ícone oficial iOS.
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Abra este endereço no Safari</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Use o aplicativo oficial <strong>Safari</strong> da Apple no seu iPhone ou iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Toque em Compartilhar</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Ícone quadrado com seta apontando para cima na barra inferior do Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Toque em "Adicionar à Tela de Início"</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Role a folha de opções para baixo até encontrar o ícone <strong>[+]</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Confirme em "Adicionar"</p>
                    <p className="text-emerald-700 dark:text-emerald-200/80 text-[11px] mt-0.5">
                      Pronto! O app <strong>MeuDinheiro</strong> aparecerá na sua tela inicial igual a um app da App Store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="space-y-3 text-center animate-in fade-in">
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Aponte a câmera do seu <strong>Android</strong> ou <strong>iPhone</strong> para abrir e instalar agora:
              </p>

              <div className="flex justify-center p-3 bg-white rounded-2xl w-fit mx-auto shadow-xl border-4 border-emerald-500/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code do Meu Dinheiro Organizado"
                    className="w-48 h-48 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Compatível com câmera nativa do iPhone (Safari) e Android (Chrome)</span>
              </div>
            </div>
          )}

          {/* Link & Quick Send Section */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Enviar link para o celular:</span>
              <button
                onClick={handleCopyLink}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 font-mono break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{appUrl}</span>
            </div>

            {canWebShare && (
              <button
                onClick={handleShare}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Compartilhar Link (WhatsApp / AirDrop)</span>
              </button>
            )}
          </div>

          {/* Native Capabilities Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Funciona Offline</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Dados no Aparelho</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 pb-safe">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <span>Fechar Guia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
