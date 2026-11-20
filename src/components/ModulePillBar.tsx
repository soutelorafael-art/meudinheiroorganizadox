import React from 'react';
import { ActiveTab } from './BottomNav';
import { playTapSound } from '../utils/sound';

interface ModulePillBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
}

export const ModulePillBar: React.FC<ModulePillBarProps> = ({
  activeTab,
  onSelectTab,
  soundEnabled,
}) => {
  const items: { id: ActiveTab; label: string; num: string }[] = [
    { id: 'welcome', label: 'Comece Aqui', num: '1' },
    { id: 'dashboard', label: 'Painel', num: '2' },
    { id: 'planning', label: 'Planejamento', num: '3' },
    { id: 'incomes', label: 'Entradas', num: '4' },
    { id: 'expenses', label: 'Despesas', num: '5' },
    { id: 'cards', label: 'Cartões', num: '6' },
    { id: 'goals', label: 'Metas & Reserva', num: '7' },
    { id: 'annual', label: 'Resumo Anual', num: '8' },
    { id: 'settings', label: 'Configurações', num: '9' },
  ];

  return (
    <div className="bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 sticky top-[95px] z-10 backdrop-blur-md transition-colors">
      {items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              playTapSound(soundEnabled);
              onSelectTab(item.id);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700/80'
            }`}
          >
            <span
              className={`text-[9px] font-mono px-1 rounded ${
                isActive
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.num}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
