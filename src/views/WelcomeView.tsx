import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Target,
  Smartphone,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../components/BottomNav';
import { playTapSound } from '../utils/sound';

interface WelcomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenInstallModal?: () => void;
  soundEnabled: boolean;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onNavigate,
  onOpenAddModal,
  onOpenInstallModal,
  soundEnabled,
}) => {
  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 p-5 @3xl:p-7 text-white shadow-xl border border-emerald-500/30">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md text-[11px] font-semibold text-emerald-200 border border-emerald-300/30 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          Módulo 1 • Comece Aqui
        </div>

        <h2 className="text-xl @3xl:text-2xl font-extrabold tracking-tight leading-tight">
          Boas-vindas ao seu novo padrão financeiro! 👋
        </h2>

        <p className="mt-2 text-xs @3xl:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          Esta ferramenta foi desenvolvida para proporcionar <strong>clareza absoluta</strong>,{' '}
          <strong>controle orçamentário</strong> e <strong>crescimento patrimonial</strong> no seu celular e no computador.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onNavigate('dashboard');
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-emerald-50 transition active:scale-95"
          >
            <span>Ir para o Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenAddModal();
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/30 text-white font-semibold text-xs border border-emerald-400/40 hover:bg-emerald-500/40 transition active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Fazer 1º Lançamento</span>
          </button>
        </div>
      </div>

      {/* Passo a Passo Rápido */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 @3xl:p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Passo a Passo Para Começar Hoje:
        </h3>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Cadastre suas Entradas</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Informe seu salário líquido mensal e rendas extras no módulo de Entradas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Defina seu Orçamento (Regra 50-30-20)</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                50% para Necessidades básicas, 30% para Desejos e 20% para Poupança & Investimentos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Acompanhe seus Cartões</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Verifique faturas abertas, limite disponível e o melhor dia de compra para não ter surpresas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              4
            </span>
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Construa sua Reserva de Emergência</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Guarde o equivalente a 6 meses de custos fixos com tranquilidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pilares */}
      <div className="grid grid-cols-3 gap-2 @3xl:gap-4 text-center">
        <div className="p-3 @3xl:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <h4 className="text-[11px] @3xl:text-xs font-bold text-slate-900 dark:text-white">Segurança</h4>
          <p className="text-[10px] @3xl:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">100% no seu aparelho</p>
        </div>

        <div className="p-3 @3xl:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
          <h4 className="text-[11px] @3xl:text-xs font-bold text-slate-900 dark:text-white">Foco</h4>
          <p className="text-[10px] @3xl:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Metas visuais claras</p>
        </div>

        <div className="p-3 @3xl:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1.5" />
          <h4 className="text-[11px] @3xl:text-xs font-bold text-slate-900 dark:text-white">Crescimento</h4>
          <p className="text-[10px] @3xl:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Patrimônio sólido</p>
        </div>
      </div>

      {/* Dica de Ouro + PWA & PC Install Tip */}
      <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-amber-800 dark:text-amber-300">Dica de Ouro da Planilha:</h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-0.5 leading-snug">
              Alimente os lançamentos <strong>semanalmente</strong> (apenas 5 minutos toda sexta ou domingo) para manter o controle total do seu orçamento sem estresse!
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold text-xs">Instale no PC ou Celular</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Funciona em tela cheia, offline e com ícone na área de trabalho!
              </p>
            </div>
          </div>

          {onOpenInstallModal && (
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                onOpenInstallModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition active:scale-95 shadow"
            >
              Instalar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
