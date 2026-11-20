import React from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Calendar, Volume2, VolumeX, Smartphone, Sun, Moon } from 'lucide-react';
import { getMonthLabel } from '../utils/formatters';
import { playTapSound } from '../utils/sound';

interface HeaderBarProps {
  selectedMonth: string;
  onMonthChange: (newMonth: string) => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentModuleName: string;
  onOpenInstallModal?: () => void;
  hasDesktopSidebar?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedMonth,
  onMonthChange,
  privacyMode,
  onTogglePrivacy,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  currentModuleName,
  onOpenInstallModal,
  hasDesktopSidebar = false,
}) => {
  const handlePrevMonth = () => {
    playTapSound(soundEnabled);
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    playTapSound(soundEnabled);
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const isLight = theme === 'light';

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-4 @3xl:px-6 py-3 sticky top-0 z-20 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Top Row: Brand (or Module Title on PC) + Inline Month Picker (PC) + Quick Action Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center shrink-0 ${
                hasDesktopSidebar ? 'lg:hidden' : ''
              }`}
            >
              <span className="font-extrabold text-xs text-slate-950">M$</span>
            </div>
            <div className="min-w-0">
              <h1
                className={`text-xs font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate ${
                  hasDesktopSidebar ? 'lg:hidden' : ''
                }`}
              >
                MEU DINHEIRO <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ORGANIZADO</span>
              </h1>
              <p
                className={`truncate ${
                  hasDesktopSidebar
                    ? 'text-[10px] lg:text-base font-medium lg:font-bold text-slate-500 dark:text-slate-400 lg:text-slate-900 dark:lg:text-white leading-tight mt-0.5 lg:mt-0'
                    : 'text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5'
                }`}
              >
                {currentModuleName}
              </p>
            </div>
          </div>

          {/* Inline Month Switcher on wide PC container */}
          <div className="hidden @3xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 shadow-inner shrink-0">
            <button
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-900 dark:text-white min-w-[132px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{getMonthLabel(selectedMonth)}</span>
            </div>

            <button
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme Toggle (Fundo Branco / Fundo Escuro) */}
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                onToggleTheme();
              }}
              title={isLight ? 'Mudar para fundo escuro' : 'Mudar para fundo branco'}
              aria-label={isLight ? 'Mudar para fundo escuro' : 'Mudar para fundo branco'}
              className="w-8 h-8 @3xl:w-9 @3xl:h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 flex items-center justify-center transition border border-slate-200 dark:border-slate-700/60 active:scale-95"
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Install Guide Button */}
            {onOpenInstallModal && (
              <button
                onClick={() => {
                  playTapSound(soundEnabled);
                  onOpenInstallModal();
                }}
                title="Instalar no celular ou PC"
                className="w-8 h-8 @3xl:w-9 @3xl:h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition border border-emerald-200 dark:border-emerald-500/30 active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                playTapSound(!soundEnabled);
              }}
              title={soundEnabled ? 'Sons ativados' : 'Sons mudos'}
              className="w-8 h-8 @3xl:w-9 @3xl:h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition border border-slate-200 dark:border-slate-700/60"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
            </button>

            {/* Privacy Toggle */}
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                onTogglePrivacy();
              }}
              title={privacyMode ? 'Mostrar valores' : 'Ocultar valores por privacidade'}
              className="w-8 h-8 @3xl:w-9 @3xl:h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition border border-slate-200 dark:border-slate-700/60"
            >
              {privacyMode ? (
                <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Stacked Month Navigation Row (Mobile / Tablet / Phone Mockup only) */}
        <div className="mt-2.5 flex @3xl:hidden items-center justify-between bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 shadow-inner">
          <button
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{getMonthLabel(selectedMonth)}</span>
          </div>

          <button
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
