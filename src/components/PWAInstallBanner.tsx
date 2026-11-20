import React, { useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallGuideModal } from './InstallGuideModal';

interface PWAInstallBannerProps {
  onOpenGuideModal?: () => void;
  soundEnabled?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onOpenGuideModal,
  soundEnabled = true,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showInternalGuide, setShowInternalGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleOpenGuide = () => {
    if (onOpenGuideModal) {
      onOpenGuideModal();
    } else {
      setShowInternalGuide(true);
    }
  };

  const bannerText = isIOS
    ? 'Adicione à Tela de Início do iPhone'
    : isAndroid
    ? 'Instale como app nativo no Android'
    : 'Disponível para Android e iPhone';

  return (
    <>
      {/* Banner in Header/Top */}
      <div className="bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-600/25 dark:via-emerald-500/20 dark:to-teal-500/25 border-b border-emerald-200 dark:border-emerald-500/30 px-3 py-2 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
        <div
          onClick={handleOpenGuide}
          className="flex items-center gap-2 truncate cursor-pointer hover:opacity-90 transition"
        >
          <img
            src="/pwa-192x192.png"
            alt="App"
            className="w-5 h-5 rounded-md shrink-0 border border-emerald-400/40"
          />
          <span className="truncate">
            <strong className="text-emerald-950 dark:text-white">App Mobile:</strong> {bannerText}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar
            </button>
          ) : isIOS ? (
            <button
              onClick={handleOpenGuide}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              iPhone
            </button>
          ) : (
            <button
              onClick={handleOpenGuide}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 transition active:scale-95 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {isAndroid ? 'Android' : 'Instalar'}
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Fechar aviso"
            className="text-emerald-700/70 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <InstallGuideModal
        isOpen={showInternalGuide}
        onClose={() => setShowInternalGuide(false)}
        soundEnabled={soundEnabled}
      />
    </>
  );
};
