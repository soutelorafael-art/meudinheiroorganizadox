import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { playTapSound } from '../utils/sound';

interface ExpensesViewProps {
  store: FinanceStore;
  onOpenAddModal: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ store, onOpenAddModal }) => {
  const {
    currentMonthTransactions,
    categories,
    deleteTransaction,
    toggleTransactionStatus,
    settings,
  } = store;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Normal expenses (excluding credit card transactions which have their own module or can be optionally included)
  const expenses = currentMonthTransactions.filter(t => t.type === 'expense');

  const totalPaid = expenses
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPending = expenses
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = totalPaid + totalPending;

  const filteredExpenses = expenses.filter(t => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || t.categoryId === selectedCategory;

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Banner KPI */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-950 dark:via-slate-900 dark:to-slate-900 p-5 @3xl:p-6 border border-rose-200 dark:border-rose-500/30 shadow-sm dark:shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Módulo 5 • Despesas & Contas</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Controle minucioso de gastos diários</p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(settings.soundEnabled);
              onOpenAddModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Big Total + Paid/Pending Split */}
        <div className="space-y-3 @3xl:space-y-0 @3xl:flex @3xl:items-end @3xl:justify-between @3xl:gap-6">
          <div>
            <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Total de Despesas no Mês</span>
            <h3 className="text-2xl @3xl:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(totalExpenses, settings.privacyMode)}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 @3xl:pt-0 border-t @3xl:border-t-0 border-rose-100 dark:border-slate-800 text-xs @3xl:min-w-[340px]">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Efetivadas (Pagas)
              </span>
              <p className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(totalPaid, settings.privacyMode)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> A Pagar (Pendentes)
              </span>
              <p className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(totalPending, settings.privacyMode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative @3xl:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar despesa por nome, loja ou nota..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 transition shadow-sm dark:shadow-none"
          />
        </div>

        {/* Category Filter Horizontal Scroll */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs @3xl:flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todas
          </button>
          {categories
            .filter(c => c.type !== 'income')
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className={filteredExpenses.length === 0 ? 'space-y-2' : 'grid grid-cols-1 @3xl:grid-cols-2 gap-2.5 @3xl:gap-3'}>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs p-4">
            <p>Nenhuma despesa encontrada.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Despesa
            </button>
          </div>
        ) : (
          filteredExpenses.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-inner"
                    style={{ backgroundColor: `${cat?.color || '#ef4444'}20`, color: cat?.color || '#ef4444' }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-xs">{item.description}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span>{formatShortDate(item.date)}</span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300">{cat?.name || 'Geral'}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.paymentMethod}
                      </span>
                      {item.notes && <span className="truncate text-slate-400 dark:text-slate-500">({item.notes})</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-extrabold text-rose-600 dark:text-rose-400 font-mono text-sm">
                      -{formatCurrency(item.amount, settings.privacyMode)}
                    </p>
                    <button
                      onClick={() => {
                        playTapSound(settings.soundEnabled);
                        toggleTransactionStatus(item.id);
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 transition ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {isCompleted ? 'Pago' : 'Pendente'}
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
