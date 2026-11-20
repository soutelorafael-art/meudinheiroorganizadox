import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Download } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  previewMode: 'mobile_mockup' | 'full_responsive';
  onTogglePreviewMode: () => void;
  onOpenInstallModal?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  sidebar,
  previewMode,
  onTogglePreviewMode,
  onOpenInstallModal,
}) => {
  const [time, setTime] = useState('');
  const [mockupOS, setMockupOS] = useState<'iphone' | 'android'>('iphone');
  const [isSmallScreenOrStandalone, setIsSmallScreenOrStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return isStandalone || window.innerWidth < 1024;
  });

  useEffect(() => {
    const checkLayout = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsSmallScreenOrStandalone(isStandalone || window.innerWidth < 1024);
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', checkLayout);

    return () => {
      window.removeEventListener('resize', checkLayout);
      mq.removeEventListener?.('change', checkLayout);
    };
  }, []);

  useEffect(() => {
    if (isSmallScreenOrStandalone || previewMode !== 'mobile_mockup') return;
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [isSmallScreenOrStandalone, previewMode]);

  // 1. Mobile / Tablet (< 1024px) or Installed Mobile PWA: pure native responsive layout
  if (isSmallScreenOrStandalone) {
    return (
      <div className="min-h-[100dvh] w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pt-safe transition-colors">
        <div className="@container flex-1 flex flex-col w-full max-w-3xl mx-auto relative pb-20">
          {children}
        </div>
      </div>
    );
  }

  // 2. Desktop / PC (>= 1024px) in Default Full Responsive PC Mode: Persistent Sidebar + Spacious Workspace
  if (previewMode === 'full_responsive') {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
        {sidebar}
        <div className="@container flex-1 min-w-0 flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  // 3. Desktop / PC Optional Phone Mockup Preview (when user clicks "Simular Celular")
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Preview Top Bar */}
      <header className="w-full bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400">MEU DINHEIRO</span> ORGANIZADO
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-medium">
            Prévia Celular
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulated OS switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-full border border-slate-200 dark:border-slate-700/80 text-[11px]">
            <button
              onClick={() => setMockupOS('iphone')}
              className={`px-2.5 py-0.5 rounded-full transition font-medium ${
                mockupOS === 'iphone'
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              iPhone
            </button>
            <button
              onClick={() => setMockupOS('android')}
              className={`px-2.5 py-0.5 rounded-full transition font-medium ${
                mockupOS === 'android'
                  ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Android
            </button>
          </div>

          {/* Install CTA */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition text-[11px] shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Back to PC Full Mode */}
          <button
            onClick={onTogglePreviewMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold transition text-[11px] shadow-sm"
            title="Voltar para o modo computador (tela cheia)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Modo PC (Tela Cheia)</span>
          </button>
        </div>
      </header>

      {/* Main Phone Mockup Container */}
      <main className="w-full flex-1 flex justify-center items-start py-4">
        <div
          className={`w-full max-w-[440px] my-3 ${
            mockupOS === 'iphone' ? 'rounded-[46px]' : 'rounded-[34px]'
          } border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] ring-1 ring-slate-300 dark:ring-slate-700/50 bg-white dark:bg-slate-950 overflow-hidden flex flex-col min-h-[860px] relative transition-colors`}
        >
          {/* Simulated Phone Status Bar */}
          <div className="w-full pt-2.5 px-6 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 select-none transition-colors">
            <span>{time || '09:41'}</span>

            {mockupOS === 'iphone' ? (
              /* iPhone Dynamic Island */
              <div className="h-5 w-24 bg-black rounded-full border border-slate-800/80 flex items-center justify-center gap-1.5 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              </div>
            ) : (
              /* Android Punch-Hole Camera */
              <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-700/90 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Inner Content Area with @container so views stay 1-column mobile inside phone mockup */}
          <div className="@container flex-1 flex flex-col overflow-y-auto no-scrollbar relative pb-20 bg-white dark:bg-slate-950 transition-colors">
            {children}
          </div>

          {/* Simulated Gesture Indicator */}
          <div
            className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 bg-slate-400/60 dark:bg-slate-600/60 rounded-full pointer-events-none z-30 ${
              mockupOS === 'iphone' ? 'w-32' : 'w-24'
            }`}
          />
        </div>
      </main>
    </div>
  );
};
