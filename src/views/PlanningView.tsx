import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, Edit3, Check, DollarSign } from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { CategoryType } from '../types/finance';
import { playTapSound, playSuccessSound } from '../utils/sound';

interface PlanningViewProps {
  store: FinanceStore;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ store }) => {
  const { categorySpending, updateCategoryBudget, monthlyTotals, settings, rule503020 } = store;

  const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const totalPlanned = categorySpending.reduce((acc, c) => acc + c.budgetMonthly, 0);
  const totalSpent = categorySpending.reduce((acc, c) => acc + c.spent, 0);
  const totalRemaining = totalPlanned - totalSpent;
  const overallPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

  const filteredCategories = categorySpending.filter(c => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const handleStartEdit = (catId: string, currentBudget: number) => {
    playTapSound(settings.soundEnabled);
    setEditingId(catId);
    setEditingValue(currentBudget.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const num = parseFloat(editingValue.replace(',', '.'));
    if (!isNaN(num) && num >= 0) {
      updateCategoryBudget(catId, num);
      playSuccessSound(settings.soundEnabled);
    }
    setEditingId(null);
  };

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Row on PC: Overview (7 cols) + Regra 50-30-20 (5 cols) */}
      <div className="space-y-4 @3xl:space-y-0 @3xl:grid @3xl:grid-cols-12 @3xl:gap-5">
        {/* Overview Card */}
        <div className="@3xl:col-span-7 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Planejamento Orçamentário</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Previsto vs. Realizado no mês</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                totalRemaining >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
              }`}
            >
              {totalRemaining >= 0 ? 'Dentro do Limite' : 'Estourado!'}
            </span>
          </div>

          {/* Global Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-700 dark:text-slate-300">Gasto Total Realizado</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {formatCurrency(totalSpent, settings.privacyMode)} de{' '}
                {formatCurrency(totalPlanned, settings.privacyMode)} (
                {formatPercentage(overallPercentage)})
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage > 100
                    ? 'bg-rose-500'
                    : overallPercentage > 85
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2">
              <span>
                Saldo a gastar:{' '}
                <strong
                  className={
                    totalRemaining >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }
                >
                  {formatCurrency(totalRemaining, settings.privacyMode)}
                </strong>
              </span>
              <span>Renda Mensal: {formatCurrency(monthlyTotals.income, settings.privacyMode)}</span>
            </div>
          </div>
        </div>

        {/* Regra 50-30-20 Summary */}
        <div className="@3xl:col-span-5 p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Distribuição Recomendada (Regra 50-30-20)</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Necessidades */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">50% Necessidades</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(rule503020.needs.ideal, settings.privacyMode)}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Gasto: {formatCurrency(rule503020.needs.spent, settings.privacyMode)}
              </span>
            </div>

            {/* Desejos */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">30% Desejos</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(rule503020.wants.ideal, settings.privacyMode)}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Gasto: {formatCurrency(rule503020.wants.spent, settings.privacyMode)}
              </span>
            </div>

            {/* Investimentos */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">20% Futuro</span>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(rule503020.savings.ideal, settings.privacyMode)}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Aportado: {formatCurrency(rule503020.savings.spent, settings.privacyMode)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            filterType === 'all'
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterType('needs')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            filterType === 'needs'
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Necessidades (50%)
        </button>
        <button
          onClick={() => setFilterType('wants')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            filterType === 'wants'
              ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Desejos (30%)
        </button>
        <button
          onClick={() => setFilterType('savings')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            filterType === 'savings'
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Investimentos (20%)
        </button>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-2.5 @3xl:gap-3.5">
        {filteredCategories.map(cat => {
          const isOver = cat.spent > cat.budgetMonthly;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{cat.name}</h4>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {cat.type === 'needs'
                      ? 'Necessidade'
                      : cat.type === 'wants'
                      ? 'Desejo'
                      : 'Investimento'}
                  </span>
                </div>

                {/* Edit Budget Button */}
                {!isEditing ? (
                  <button
                    onClick={() => handleStartEdit(cat.id, cat.budgetMonthly)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                    title="Editar Teto Orçado"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ajustar Teto</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      autoFocus
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="w-20 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-purple-500 text-slate-900 dark:text-white text-xs font-mono"
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    Gasto: <strong className="text-slate-900 dark:text-white">{formatCurrency(cat.spent, settings.privacyMode)}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    Teto: {formatCurrency(cat.budgetMonthly, settings.privacyMode)}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : cat.percentage > 85
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    {isOver ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3 inline" /> Estourado em{' '}
                        {formatCurrency(Math.abs(cat.remaining), settings.privacyMode)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 inline" /> Restam{' '}
                        {formatCurrency(cat.remaining, settings.privacyMode)}
                      </span>
                    )}
                  </span>

                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPercentage(cat.percentage)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
