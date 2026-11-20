import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Clock,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatPercentage, formatShortDate } from '../utils/formatters';
import { ActiveTab } from '../components/BottomNav';
import { playTapSound } from '../utils/sound';

interface DashboardViewProps {
  store: FinanceStore;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  store,
  onNavigate,
  onOpenAddModal,
}) => {
  const {
    monthlyTotals,
    categorySpending,
    rule503020,
    currentMonthTransactions,
    settings,
    categories,
    cards,
  } = store;

  const isPositive = monthlyTotals.netBalance >= 0;

  // Filter top 4 recent transactions
  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Row on PC: Hero Balance (7 cols) + Split Outflow Cards (5 cols) */}
      <div className="space-y-4 @3xl:space-y-0 @3xl:grid @3xl:grid-cols-12 @3xl:gap-5">
        {/* Main Balance Card (Hero) */}
        <div className="@3xl:col-span-7 relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 @3xl:p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Saldo Líquido Previsto</span>
              </div>

              <div
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                  isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>Poupança {formatPercentage(Math.max(0, monthlyTotals.savingsRate))}</span>
              </div>
            </div>

            {/* Big Balance Amount */}
            <div className="mt-3">
              <h2
                className={`text-3xl @3xl:text-4xl font-extrabold tracking-tight font-mono ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(monthlyTotals.netBalance, settings.privacyMode)}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <span>Disponível após todas as despesas e faturas do mês</span>
              </p>
            </div>
          </div>

          {/* Quick KPI Row: Entradas & Saídas */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-3">
            <div
              onClick={() => onNavigate('incomes')}
              className="cursor-pointer p-2.5 @3xl:p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Total Entradas</span>
              </div>
              <p className="text-sm @3xl:text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(monthlyTotals.income, settings.privacyMode)}
              </p>
            </div>

            <div
              onClick={() => onNavigate('expenses')}
              className="cursor-pointer p-2.5 @3xl:p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-rose-400 dark:hover:border-rose-500/40 transition"
            >
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Saídas</span>
              </div>
              <p className="text-sm @3xl:text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(monthlyTotals.totalOutflow, settings.privacyMode)}
              </p>
            </div>
          </div>
        </div>

        {/* Credit Card & Outflow Split */}
        <div className="@3xl:col-span-5 grid grid-cols-2 @3xl:grid-cols-1 gap-2.5 @3xl:gap-4">
          {/* Despesas em Conta */}
          <div
            onClick={() => onNavigate('expenses')}
            className="cursor-pointer p-3.5 @3xl:p-5 rounded-2xl @3xl:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px] @3xl:text-xs font-medium">
              <span>À Vista / Débito</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-base @3xl:text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(monthlyTotals.expense, settings.privacyMode)}
              </p>
              <span className="text-[10px] @3xl:text-xs text-slate-500 mt-0.5 block">Pix, boletos e contas</span>
            </div>
          </div>

          {/* Fatura dos Cartões */}
          <div
            onClick={() => onNavigate('cards')}
            className="cursor-pointer p-3.5 @3xl:p-5 rounded-2xl @3xl:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/40 shadow-xs transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px] @3xl:text-xs font-medium">
              <span>Faturas Cartão</span>
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-base @3xl:text-2xl font-bold text-amber-600 dark:text-amber-300 mt-1 font-mono">
                {formatCurrency(monthlyTotals.creditCard, settings.privacyMode)}
              </p>
              <span className="text-[10px] @3xl:text-xs text-slate-500 mt-0.5 block">
                {cards.length} {cards.length === 1 ? 'cartão ativo' : 'cartões ativos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row on PC: 50-30-20 + Top Categories Side-by-Side */}
      <div className="space-y-4 @3xl:space-y-0 @3xl:grid @3xl:grid-cols-2 @3xl:gap-5">
        {/* 50-30-20 Rule Status Card */}
        <div className="p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white">Método 50-30-20 (Orçamento Ideal)</h3>
            </div>
            <button
              onClick={() => onNavigate('planning')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center"
            >
              Ajustar <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* 3 Progress Bars */}
          <div className="space-y-2.5 text-xs">
            {/* Necessidades (50%) */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Necessidades (Teto 50%)
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {formatCurrency(rule503020.needs.spent, settings.privacyMode)} /{' '}
                  <span className="text-slate-500">{formatPercentage(rule503020.needs.percent)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rule503020.needs.percent > 50 ? 'bg-amber-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, rule503020.needs.percent)}%` }}
                />
              </div>
            </div>

            {/* Desejos (30%) */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Desejos & Lazer (Teto 30%)
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {formatCurrency(rule503020.wants.spent, settings.privacyMode)} /{' '}
                  <span className="text-slate-500">{formatPercentage(rule503020.wants.percent)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rule503020.wants.percent > 30 ? 'bg-rose-400' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, rule503020.wants.percent)}%` }}
                />
              </div>
            </div>

            {/* Investimentos & Poupança (20%) */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Poupança & Futuro (Meta 20%)
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatCurrency(rule503020.savings.spent, settings.privacyMode)} /{' '}
                  <span className="text-emerald-700 dark:text-emerald-300">{formatPercentage(rule503020.savings.percent)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, rule503020.savings.percent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Categorias de Gastos */}
        <div className="p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white">Maiores Gastos do Mês</h3>
            <button
              onClick={() => onNavigate('planning')}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5">
            {categorySpending.slice(0, 4).map(cat => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(cat.spent, settings.privacyMode)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: cat.color,
                      width: `${Math.min(100, cat.percentage)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos Lançamentos */}
      <div className="p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Lançamentos Recentes</h3>
          </div>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center"
          >
            Ver extrato <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Nenhum lançamento registrado neste mês ainda.
            <button
              onClick={onOpenAddModal}
              className="mt-2 block mx-auto text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Adicionar primeiro
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const isIncome = tx.type === 'income';
              const isCard = tx.type === 'credit_card';

              return (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : isCard
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>{formatShortDate(tx.date)}</span>
                        <span>•</span>
                        <span className="truncate">{cat?.name || 'Geral'}</span>
                        {isCard && <span className="text-amber-600 dark:text-amber-400 font-medium">Cartão</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold font-mono ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCard
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount, settings.privacyMode)}
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      {tx.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-500 inline" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-500 inline" />
                      )}
                      {tx.status === 'completed' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
