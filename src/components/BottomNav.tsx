import React from 'react';
import { LayoutDashboard, Receipt, Plus, CreditCard, LayoutGrid } from 'lucide-react';
import { playTapSound } from '../utils/sound';

export type ActiveTab =
  | 'welcome'
  | 'dashboard'
  | 'planning'
  | 'incomes'
  | 'expenses'
  | 'cards'
  | 'goals'
  | 'annual'
  | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenModulesMenu: () => void;
  soundEnabled: boolean;
  previewMode?: 'mobile_mockup' | 'full_responsive';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenModulesMenu,
  soundEnabled,
  previewMode = 'mobile_mockup',
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    playTapSound(soundEnabled);
    onSelectTab(tab);
  };

  const isMenuSelected =
    activeTab === 'welcome' ||
    activeTab === 'planning' ||
    activeTab === 'goals' ||
    activeTab === 'annual' ||
    activeTab === 'settings';

  const maxWidthClass =
    previewMode === 'full_responsive' ? 'sm:max-w-3xl' : 'sm:max-w-[440px]';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 w-full ${maxWidthClass} mx-auto bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800/90 backdrop-blur-lg px-2 pt-2 pb-safe shadow-[0_-8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_-10px_25px_rgba(0,0,0,0.5)] select-none transition-colors`}
    >
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Painel */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1">Painel</span>
        </button>

        {/* Tab 2: Despesas / Extrato */}
        <button
          onClick={() => handleTabClick('expenses')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'expenses' || activeTab === 'incomes'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
            {(activeTab === 'expenses' || activeTab === 'incomes') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1">Extrato</span>
        </button>

        {/* Central Floating Action Button (+) */}
        <div className="flex flex-col items-center justify-center -mt-6 flex-1">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenAddModal();
            }}
            aria-label="Adicionar novo lançamento"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.4)] active:scale-95 transition transform hover:scale-105 border-4 border-white dark:border-slate-900"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Novo</span>
        </div>

        {/* Tab 3: Cartões */}
        <button
          onClick={() => handleTabClick('cards')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'cards'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CreditCard className="w-5 h-5" />
            {activeTab === 'cards' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1">Cartões</span>
        </button>

        {/* Tab 4: Todos os Módulos */}
        <button
          onClick={() => {
            playTapSound(soundEnabled);
            onOpenModulesMenu();
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            isMenuSelected
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="w-5 h-5" />
            {isMenuSelected && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1">Módulos</span>
        </button>
      </div>
    </nav>
  );
};
