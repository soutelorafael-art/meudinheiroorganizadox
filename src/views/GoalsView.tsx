import React, { useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Plus,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Palmtree,
  Laptop,
  Car,
  Home,
  GraduationCap,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { FinancialGoal } from '../types/finance';
import { playSuccessSound, playTapSound } from '../utils/sound';

interface GoalsViewProps {
  store: FinanceStore;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ store }) => {
  const { goals, addGoal, updateGoalAmount, deleteGoal, settings, rule503020 } = store;

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [category, setCategory] = useState<FinancialGoal['category']>('emergency');
  const [color, setColor] = useState('#10b981');
  const [goalFormError, setGoalFormError] = useState('');

  // Quick Deposit modal
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('200');

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Recommended emergency fund: 6 months of basic needs
  const monthlyNeedCost = rule503020.needs.spent || 3000;
  const recommendedEmergencyFund = monthlyNeedCost * 6;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(',', '.'));
    const initial = parseFloat(initialAmount.replace(',', '.')) || 0;

    if (!goalTitle.trim() || isNaN(target) || target <= 0) {
      setGoalFormError('Preencha o nome da meta e um valor alvo válido.');
      return;
    }

    setGoalFormError('');
    addGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      deadline,
      category,
      color,
      icon: category === 'travel' ? 'Palmtree' : category === 'purchase' ? 'Laptop' : 'ShieldCheck',
    });

    playSuccessSound(settings.soundEnabled);
    setShowAddGoalModal(false);
    setGoalTitle('');
    setTargetAmount('');
    setInitialAmount('');
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount.replace(',', '.'));
    if (!isNaN(amt) && amt > 0 && depositGoalId) {
      updateGoalAmount(depositGoalId, amt);
      playSuccessSound(settings.soundEnabled);
      setDepositGoalId(null);
    }
  };

  const getGoalIcon = (cat: string) => {
    switch (cat) {
      case 'travel':
        return <Palmtree className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'purchase':
        return <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Row on PC: Global KPI (7 cols) + Emergency Fund Tip (5 cols) */}
      <div className="space-y-4 @3xl:space-y-0 @3xl:grid @3xl:grid-cols-12 @3xl:gap-5">
        {/* Top Banner KPI */}
        <div className="@3xl:col-span-7 rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-white dark:from-cyan-950 dark:via-slate-900 dark:to-slate-900 p-5 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Módulo 7 • Metas & Reserva</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Construção de Patrimônio e Segurança</p>
              </div>
            </div>

            <button
              onClick={() => {
                setGoalFormError('');
                setShowAddGoalModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Meta</span>
            </button>
          </div>

          {/* Global Progress */}
          <div>
            <span className="text-[11px] text-cyan-700 dark:text-cyan-300 font-medium">Patrimônio Acumulado em Metas</span>
            <h3 className="text-2xl @3xl:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(totalSaved, settings.privacyMode)}
            </h3>

            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                <span>Progresso Global</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">
                  {formatPercentage(overallProgress)} de {formatCurrency(totalTarget, settings.privacyMode)}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Fund Intelligence Tip */}
        <div className="@3xl:col-span-5 p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Cálculo Inteligente de Reserva de Emergência</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Com base nos seus gastos fixos mensais de{' '}
            <strong className="text-slate-900 dark:text-white">{formatCurrency(monthlyNeedCost, settings.privacyMode)}</strong>,
            sua reserva ideal recomendada de 6 meses é de:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              {formatCurrency(recommendedEmergencyFund, settings.privacyMode)}
            </strong>.
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3 @3xl:gap-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isFinished = progress >= 100;

          return (
            <div
              key={goal.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${goal.color}20`,
                      borderColor: `${goal.color}40`,
                    }}
                  >
                    {getGoalIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{goal.title}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      Prazo: {goal.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      playTapSound(settings.soundEnabled);
                      setDepositGoalId(goal.id);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-500/40 flex items-center gap-1 transition active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Guardar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Excluir a meta "${goal.title}"?`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Visual */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(goal.currentAmount, settings.privacyMode)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Meta: {formatCurrency(goal.targetAmount, settings.privacyMode)}
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: goal.color,
                      width: `${Math.min(100, progress)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>
                    {isFinished ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 inline" /> Meta Conquistada! Parabéns!
                      </span>
                    ) : (
                      <span>Faltam {formatCurrency(remaining, settings.privacyMode)}</span>
                    )}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatPercentage(progress)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Guardar Dinheiro na Meta</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Adicione um novo aporte para acelerar sua conquista:</p>

            <form onSubmit={handleDeposit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Valor do Aporte (R$)</label>
                <input
                  type="number"
                  autoFocus
                  placeholder="200"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-emerald-500 text-slate-900 dark:text-white font-mono text-base font-bold text-center focus:outline-none"
                  required
                />
              </div>

              {/* Quick pills */}
              <div className="flex justify-center gap-1.5 flex-wrap">
                {[50, 100, 200, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                  >
                    +R${val}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Criar Nova Meta de Economia</h3>

            {goalFormError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-[11px]">
                {goalFormError}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Nome da Meta</label>
                <input
                  type="text"
                  placeholder="Ex: Viagem Disney, Reforma, Carro..."
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Já Tenho Guardado</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Categoria da Meta</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as FinancialGoal['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="emergency">Reserva de Emergência</option>
                  <option value="travel">Viagem / Férias</option>
                  <option value="purchase">Bens / Compras Grandes</option>
                  <option value="education">Cursos / Educação</option>
                  <option value="investment">Investimento / Patrimônio</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Data Prevista (Prazo)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Cor</label>
                <div className="flex gap-2">
                  {['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        color === col ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
