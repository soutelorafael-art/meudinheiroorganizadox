import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  PiggyBank,
  ChevronRight,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { playTapSound } from '../utils/sound';

interface AnnualViewProps {
  store: FinanceStore;
  onSelectMonthAndNavigate: (monthKey: string) => void;
}

export const AnnualView: React.FC<AnnualViewProps> = ({
  store,
  onSelectMonthAndNavigate,
}) => {
  const { annualSummary, settings, selectedMonth } = store;

  // Max value to scale monthly bars
  const maxMonthValue = Math.max(
    1,
    ...annualSummary.months.map(m => Math.max(m.income, m.expense))
  );

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Row on PC: Annual KPI (5 cols) + 12-Month Chart (7 cols) */}
      <div className="space-y-4 @4xl:space-y-0 @4xl:grid @4xl:grid-cols-12 @4xl:gap-5">
        {/* Top Banner KPI */}
        <div className="@4xl:col-span-5 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-white dark:from-violet-950 dark:via-slate-900 dark:to-slate-900 p-5 border border-violet-200 dark:border-violet-500/30 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Módulo 8 • Resumo Anual ({annualSummary.year})
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Consolidação de Jan a Dez</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold text-[11px] border border-violet-200 dark:border-violet-500/30">
              {annualSummary.year}
            </span>
          </div>

          {/* Big Balance */}
          <div>
            <span className="text-[11px] text-violet-700 dark:text-violet-300 font-medium">Economia Líquida no Ano</span>
            <h3
              className={`text-2xl @3xl:text-3xl font-extrabold font-mono mt-0.5 ${
                annualSummary.totalNet >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(annualSummary.totalNet, settings.privacyMode)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Taxa média anual de poupança:{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {formatPercentage(annualSummary.overallSavingsRate)}
              </strong>
            </p>
          </div>

          {/* 2 KPIs: Entradas & Saídas Totais */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-violet-100 dark:border-slate-800 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3" /> Receitas Anuais
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(annualSummary.totalIncome, settings.privacyMode)}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Gastos Anuais
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatCurrency(annualSummary.totalExpense, settings.privacyMode)}
              </p>
            </div>
          </div>
        </div>

        {/* 12-Month Visual Bar Chart */}
        <div className="@4xl:col-span-7 p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white">Comparativo Mensal (12 Meses)</h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Entradas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" /> Saídas
              </span>
            </div>
          </div>

          {/* Responsive Bar Container */}
          <div className="pt-6 pb-2 px-1 flex items-end justify-between gap-1.5 h-44 @4xl:h-52 overflow-x-auto no-scrollbar">
            {annualSummary.months.map(m => {
              const isCurrentSelected = m.monthKey === selectedMonth;
              const incHeight = (m.income / maxMonthValue) * 110;
              const expHeight = (m.expense / maxMonthValue) * 110;

              return (
                <button
                  key={m.monthKey}
                  onClick={() => {
                    playTapSound(settings.soundEnabled);
                    onSelectMonthAndNavigate(m.monthKey);
                  }}
                  className={`flex-1 min-w-[22px] flex flex-col items-center justify-end group transition rounded-lg p-0.5 ${
                    isCurrentSelected
                      ? 'bg-violet-50 dark:bg-slate-800/80 ring-1 ring-violet-500 dark:ring-violet-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                  title={`${m.label}: Entradas ${formatCurrency(m.income)} | Saídas ${formatCurrency(m.expense)}`}
                >
                  {/* Dual Bars side-by-side */}
                  <div className="flex items-end gap-1 h-32 w-full justify-center">
                    {/* Income Bar */}
                    <div
                      className="w-2 @3xl:w-2.5 rounded-t-sm bg-emerald-500/90 group-hover:bg-emerald-400 transition-all duration-300"
                      style={{ height: `${Math.max(4, incHeight)}px` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-2 @3xl:w-2.5 rounded-t-sm bg-rose-500/90 group-hover:bg-rose-400 transition-all duration-300"
                      style={{ height: `${Math.max(4, expHeight)}px` }}
                    />
                  </div>

                  {/* Month label */}
                  <span
                    className={`text-[9px] @3xl:text-[10px] font-bold mt-1.5 font-mono ${
                      isCurrentSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 12 Months Breakdown List */}
      <div className="p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <h3 className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white mb-2">Visão Detalhada Mês a Mês</h3>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 gap-2 @3xl:gap-2.5">
          {annualSummary.months.map(m => {
            const isCurrentSelected = m.monthKey === selectedMonth;
            const isPositive = m.net >= 0;

            return (
              <div
                key={m.monthKey}
                onClick={() => {
                  playTapSound(settings.soundEnabled);
                  onSelectMonthAndNavigate(m.monthKey);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                  isCurrentSelected
                    ? 'bg-violet-50 dark:bg-slate-800 border-violet-300 dark:border-violet-500/50 shadow-sm dark:shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs font-mono ${
                      isCurrentSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {m.label} • {annualSummary.year}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Entradas: {formatCurrency(m.income, settings.privacyMode)} | Saídas:{' '}
                      {formatCurrency(m.expense, settings.privacyMode)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right font-mono">
                    <p
                      className={`font-bold text-xs ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrency(m.net, settings.privacyMode)}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatPercentage(m.savingsRate)} poupado
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
