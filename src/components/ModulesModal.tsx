import React from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Trophy,
  BarChart3,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { playTapSound } from '../utils/sound';

interface ModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectModule: (tab: ActiveTab) => void;
  soundEnabled: boolean;
}

export const ModulesModal: React.FC<ModulesModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectModule,
  soundEnabled,
}) => {
  if (!isOpen) return null;

  const modules: {
    id: ActiveTab;
    num: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'welcome',
      num: '1',
      title: 'Comece Aqui',
      description: 'Guia de uso e orientações práticas passo a passo',
      icon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'from-emerald-50 to-teal-50/50 dark:from-emerald-500/20 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/30',
      badge: 'Guia',
    },
    {
      id: 'dashboard',
      num: '2',
      title: 'Painel Financeiro',
      description: 'Dashboard dinâmico com KPIs e gráficos executivos',
      icon: <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'from-blue-50 to-indigo-50/50 dark:from-blue-500/20 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30',
      badge: 'Principal',
    },
    {
      id: 'planning',
      num: '3',
      title: 'Planejamento',
      description: 'Orçamento previsto versus realizado do mês (50-30-20)',
      icon: <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'from-purple-50 to-pink-50/50 dark:from-purple-500/20 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30',
    },
    {
      id: 'incomes',
      num: '4',
      title: 'Entradas',
      description: 'Registro de salários, rendas extras e proventos',
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'from-emerald-50 to-green-50/50 dark:from-emerald-500/20 dark:to-green-500/10 border-emerald-200 dark:border-emerald-500/30',
    },
    {
      id: 'expenses',
      num: '5',
      title: 'Despesas',
      description: 'Controle minucioso de gastos e pagamentos diários',
      icon: <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      color: 'from-rose-50 to-red-50/50 dark:from-rose-500/20 dark:to-red-500/10 border-rose-200 dark:border-rose-500/30',
    },
    {
      id: 'cards',
      num: '6',
      title: 'Cartão de Crédito',
      description: 'Gestão de limites, faturas e compras parceladas',
      icon: <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'from-amber-50 to-yellow-50/50 dark:from-amber-500/20 dark:to-yellow-500/10 border-amber-200 dark:border-amber-500/30',
    },
    {
      id: 'goals',
      num: '7',
      title: 'Metas & Reserva',
      description: 'Metas de economia com barra de progresso visual',
      icon: <Trophy className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      color: 'from-cyan-50 to-sky-50/50 dark:from-cyan-500/20 dark:to-sky-500/10 border-cyan-200 dark:border-cyan-500/30',
      badge: 'Patrimônio',
    },
    {
      id: 'annual',
      num: '8',
      title: 'Resumo Anual',
      description: 'Visão consolidada mês a mês de Jan a Dez',
      icon: <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
      color: 'from-violet-50 to-fuchsia-50/50 dark:from-violet-500/20 dark:to-fuchsia-500/10 border-violet-200 dark:border-violet-500/30',
    },
    {
      id: 'settings',
      num: '9',
      title: 'Configurações',
      description: 'Categorias, formas de pagamento, backup e parâmetros',
      icon: <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
      color: 'from-slate-50 to-slate-100/80 dark:from-slate-700/30 dark:to-slate-800/20 border-slate-200 dark:border-slate-700/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900/90">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SISTEMA INTEGRADO</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Acesso aos 9 Módulos</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules Grid */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {modules.map(mod => {
            const isCurrent = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  playTapSound(soundEnabled);
                  onSelectModule(mod.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-2xl border transition relative flex items-start gap-3 bg-gradient-to-br ${
                  mod.color
                } ${
                  isCurrent
                    ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-lg scale-[1.01]'
                    : 'hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.99]'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50 shadow-sm shrink-0">
                  {mod.icon}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                      {mod.num}.
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{mod.title}</h3>
                    {mod.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-500/30">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/40">
                    Ativo
                  </span>
                )}
              </button>
            );
          })}

          {/* Dica de Ouro from spreadsheet */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-yellow-500/10 dark:to-amber-500/5 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">💡 Dica de Ouro:</span>
            Alimente os lançamentos semanalmente para manter o controle total do seu orçamento.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center text-[11px] text-slate-500 shrink-0">
          MEU DINHEIRO ORGANIZADO • PRODUTO PREMIUM
        </div>
      </div>
    </div>
  );
};
