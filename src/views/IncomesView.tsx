import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Briefcase,
  Coins,
  PieChart,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { playTapSound } from '../utils/sound';

interface IncomesViewProps {
  store: FinanceStore;
  onOpenAddModal: () => void;
}

export const IncomesView: React.FC<IncomesViewProps> = ({ store, onOpenAddModal }) => {
  const {
    currentMonthTransactions,
    categories,
    deleteTransaction,
    toggleTransactionStatus,
    settings,
  } = store;

  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const incomes = currentMonthTransactions.filter(t => t.type === 'income');

  const totalReceived = incomes
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPending = incomes
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncomes = totalReceived + totalPending;

  const filteredIncomes = incomes.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Banner KPI */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 p-5 @3xl:p-6 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Módulo 4 • Entradas & Rendas</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Salários, Freelas e Rendimentos</p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(settings.soundEnabled);
              onOpenAddModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Big Total + Received/Pending Split */}
        <div className="space-y-3 @3xl:space-y-0 @3xl:flex @3xl:items-end @3xl:justify-between @3xl:gap-6">
          <div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Total de Entradas no Mês</span>
            <h3 className="text-2xl @3xl:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(totalIncomes, settings.privacyMode)}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 @3xl:pt-0 border-t @3xl:border-t-0 border-emerald-200/70 dark:border-slate-800 text-xs @3xl:min-w-[320px]">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Já Recebido
              </span>
              <p className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(totalReceived, settings.privacyMode)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> A Receber
              </span>
              <p className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(totalPending, settings.privacyMode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs @3xl:max-w-md">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition text-center ${
            filter === 'all'
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Todas ({incomes.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition text-center ${
            filter === 'completed'
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Recebidas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition text-center ${
            filter === 'pending'
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          A Receber
        </button>
      </div>

      {/* Incomes List */}
      <div className={filteredIncomes.length === 0 ? 'space-y-2' : 'grid grid-cols-1 @3xl:grid-cols-2 gap-2.5 @3xl:gap-3'}>
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs p-4">
            <p>Nenhuma entrada encontrada para este filtro.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Renda
            </button>
          </div>
        ) : (
          filteredIncomes.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      playTapSound(settings.soundEnabled);
                      toggleTransactionStatus(item.id);
                    }}
                    title={isCompleted ? 'Marcar como pendente' : 'Marcar como recebido'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/40'
                    }`}
                  >
                    {item.categoryId === 'cat_salario' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : item.categoryId === 'cat_extra' ? (
                      <Coins className="w-4 h-4" />
                    ) : (
                      <PieChart className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-xs">{item.description}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{formatShortDate(item.date)}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{cat?.name || 'Entrada'}</span>
                      {item.notes && <span className="truncate">({item.notes})</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      +{formatCurrency(item.amount, settings.privacyMode)}
                    </p>
                    <button
                      onClick={() => {
                        playTapSound(settings.soundEnabled);
                        toggleTransactionStatus(item.id);
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {isCompleted ? 'Recebido' : 'Pendente'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      playTapSound(settings.soundEnabled);
                      if (confirm('Deseja excluir este lançamento?')) {
                        deleteTransaction(item.id);
                      }
                    }}
                    aria-label="Excluir"
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
