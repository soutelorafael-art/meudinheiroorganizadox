import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Trophy,
  BarChart3,
  Settings,
  Plus,
  Smartphone,
  Download,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { LicenseState } from '../utils/licensing';
import { playTapSound } from '../utils/sound';

interface DesktopSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  onSwitchToMobilePreview: () => void;
  onOpenActivationModal: () => void;
  license: LicenseState;
  soundEnabled: boolean;
}

const NAV_ITEMS: {
  id: ActiveTab;
  num: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'welcome', num: '1', label: 'Comece Aqui', icon: Sparkles },
  { id: 'dashboard', num: '2', label: 'Painel Financeiro', icon: LayoutDashboard },
  { id: 'planning', num: '3', label: 'Planejamento', icon: Target },
  { id: 'incomes', num: '4', label: 'Entradas & Rendas', icon: ArrowDownLeft },
  { id: 'expenses', num: '5', label: 'Despesas & Contas', icon: ArrowUpRight },
  { id: 'cards', num: '6', label: 'Cartões de Crédito', icon: CreditCard },
  { id: 'goals', num: '7', label: 'Metas & Reserva', icon: Trophy },
  { id: 'annual', num: '8', label: 'Resumo Anual', icon: BarChart3 },
  { id: 'settings', num: '9', label: 'Configurações', icon: Settings },
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenInstallModal,
  onSwitchToMobilePreview,
  onOpenActivationModal,
  license,
  soundEnabled,
}) => {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/90 transition-colors select-none z-30">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
          <span className="font-extrabold text-sm text-slate-950">M$</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
            MEU DINHEIRO
          </p>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
            ORGANIZADO
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 pb-2">
        <button
          type="button"
          onClick={() => {
            playTapSound(soundEnabled);
            onOpenAddModal();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* 9 Modules Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar" aria-label="Módulos principais">
        <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Módulos do Sistema
        </p>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playTapSound(soundEnabled);
                onSelectTab(item.id);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span
                className={`text-[10px] font-mono ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {item.num}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Bottom Utilities */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        {!license.isActivated ? (
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenActivationModal();
            }}
            className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-left transition flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                Liberar por R$ 5,00
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                Pix único · Acesso vitalício
              </p>
            </div>
          </button>
        ) : (
          <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Licença Completa Ativa</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenInstallModal();
            }}
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/70 transition"
            title="Instalar no PC, Android ou iPhone"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Instalar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onSwitchToMobilePreview();
            }}
            className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/70 transition"
            title="Visualizar em moldura de celular"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="truncate">Celular</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
