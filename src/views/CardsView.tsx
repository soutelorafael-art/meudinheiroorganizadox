import React, { useState } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Calendar,
  Layers,
  Trash2,
  AlertCircle,
  TrendingDown,
  Wifi,
} from 'lucide-react';
import { FinanceStore } from '../hooks/useFinanceStore';
import { formatCurrency, formatPercentage, formatShortDate } from '../utils/formatters';
import { playTapSound } from '../utils/sound';

interface CardsViewProps {
  store: FinanceStore;
  onOpenAddModal: () => void;
}

export const CardsView: React.FC<CardsViewProps> = ({ store, onOpenAddModal }) => {
  const { cardsWithInvoices, currentMonthTransactions, addCard, deleteCard, settings } = store;

  const [selectedCardId, setSelectedCardId] = useState<string>(
    cardsWithInvoices[0]?.id || ''
  );

  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardBank, setNewCardBank] = useState('');
  const [newCardDigits, setNewCardDigits] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardClosing, setNewCardClosing] = useState('5');
  const [newCardDue, setNewCardDue] = useState('12');
  const [newCardColor, setNewCardColor] = useState('#820ad1');
  const [cardFormError, setCardFormError] = useState('');

  const activeCard =
    cardsWithInvoices.find(c => c.id === selectedCardId) || cardsWithInvoices[0];

  const cardTransactions = currentMonthTransactions.filter(
    t => t.type === 'credit_card' && t.cardId === activeCard?.id
  );

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newCardLimit.replace(',', '.'));
    if (!newCardName.trim() || isNaN(limit) || limit <= 0) {
      setCardFormError('Preencha o nome do cartão e um limite válido.');
      return;
    }

    setCardFormError('');
    addCard({
      name: newCardName.trim(),
      bank: newCardBank.trim() || 'Banco',
      lastFourDigits: newCardDigits.slice(-4) || '1234',
      limit,
      closingDay: parseInt(newCardClosing, 10) || 5,
      dueDay: parseInt(newCardDue, 10) || 12,
      brandColor: newCardColor,
    });

    setShowNewCardModal(false);
    setNewCardName('');
    setNewCardLimit('');
    setNewCardDigits('');
  };

  return (
    <div className="p-4 @3xl:p-6 space-y-4 @3xl:space-y-5 animate-in fade-in">
      {/* Top Banner KPI */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CreditCardIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Módulo 6 • Cartão de Crédito</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Limites, faturas e parcelamentos</p>
        </div>

        <button
          onClick={() => {
            setCardFormError('');
            setShowNewCardModal(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Cards Horizontal Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cardsWithInvoices.map(card => {
          const isSelected = card.id === activeCard?.id;
          return (
            <button
              key={card.id}
              onClick={() => {
                playTapSound(settings.soundEnabled);
                setSelectedCardId(card.id);
              }}
              className={`px-3 py-2 rounded-2xl border text-left shrink-0 transition flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-amber-50 dark:bg-slate-800 border-amber-400 shadow-md dark:shadow-lg ring-1 ring-amber-400/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: card.brandColor }}
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">{card.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {formatCurrency(card.currentInvoiceTotal, settings.privacyMode)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop 2-Column Split: Card Visual + Limit on Left (5 cols), Purchases on Right (7 cols) */}
      <div className="space-y-4 @3xl:space-y-0 @3xl:grid @3xl:grid-cols-12 @3xl:gap-5 @3xl:items-start">
        <div className="@3xl:col-span-5 space-y-4">
          {/* Realistic Credit Card Canvas Visual (intentional colored bank card with white text) */}
          {activeCard && (
            <div
              className="rounded-3xl p-5 text-white shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-300 border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${activeCard.brandColor}ee 0%, #0f172a 100%)`,
              }}
            >
              {/* Subtle card sheen decoration */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top of Card */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest uppercase opacity-90">
                  {activeCard.bank}
                </span>
                <Wifi className="w-5 h-5 opacity-70 rotate-90" />
              </div>

              {/* Chip */}
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-200 border border-yellow-500 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-yellow-600/60" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-yellow-600/60" />
                </div>
                <span className="text-[10px] text-white/70 font-mono">Cartão de Crédito</span>
              </div>

              {/* Card Number & Invoice */}
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-white/70 font-medium">Fatura Atual do Mês</p>
                  <h3 className="text-2xl font-extrabold font-mono tracking-tight text-white drop-shadow-sm">
                    {formatCurrency(activeCard.currentInvoiceTotal, settings.privacyMode)}
                  </h3>
                </div>

                <p className="text-xs font-mono tracking-widest text-white/90">
                  •••• {activeCard.lastFourDigits}
                </p>
              </div>

              {/* Bottom Card Footer: Dates */}
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-white/70" />
                  <span>Fecha dia {activeCard.closingDay}</span>
                </div>
                <div>
                  <span>Vence dia {activeCard.dueDay}</span>
                </div>
              </div>
            </div>
          )}

          {/* Limit Metrics Breakdown */}
          {activeCard && (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Utilização do Limite Total</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {formatPercentage(activeCard.limitUsedPercent)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeCard.limitUsedPercent > 80 ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, activeCard.limitUsedPercent)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Limite Disponível</span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatCurrency(activeCard.availableLimit, settings.privacyMode)}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Limite Total Contratado</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {formatCurrency(activeCard.limit, settings.privacyMode)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Card Button */}
          {activeCard && cardsWithInvoices.length > 1 && (
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Deseja realmente remover o cartão ${activeCard.name}?`
                    )
                  ) {
                    deleteCard(activeCard.id);
                  }
                }}
                className="text-xs text-rose-600/80 dark:text-rose-400/80 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                Remover este cartão
              </button>
            </div>
          )}
        </div>

        {/* Invoices and Purchases on this card */}
        <div className="@3xl:col-span-7 p-4 @3xl:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-xs @3xl:text-sm font-bold text-slate-900 dark:text-white">
                Compras na Fatura Atual ({cardTransactions.length})
              </h3>
            </div>

            <button
              onClick={onOpenAddModal}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-bold"
            >
              + Lançar Compra
            </button>
          </div>

          {cardTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhuma compra registrada neste cartão para o mês selecionado.
            </div>
          ) : (
            <div className="space-y-2">
              {cardTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{tx.description}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{formatShortDate(tx.date)}</span>
                      {tx.installmentTotal && tx.installmentTotal > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[10px] border border-amber-200 dark:border-amber-500/30">
                          Parcela {tx.installmentCurrent}/{tx.installmentTotal}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {formatCurrency(tx.amount, settings.privacyMode)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Card Modal */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Cadastrar Novo Cartão</h3>

            {cardFormError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{cardFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCard} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, C6 Carbon, XP..."
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Banco / Emissor</label>
                  <input
                    type="text"
                    placeholder="Ex: Nubank, Itaú"
                    value={newCardBank}
                    onChange={e => setNewCardBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Últimos 4 Dígitos</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={newCardDigits}
                    onChange={e => setNewCardDigits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Limite Total (R$)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={newCardLimit}
                  onChange={e => setNewCardLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Dia Fechamento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newCardClosing}
                    onChange={e => setNewCardClosing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newCardDue}
                    onChange={e => setNewCardDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Cor do Cartão</label>
                <div className="flex gap-2">
                  {['#820ad1', '#ff6200', '#0f172a', '#2563eb', '#059669', '#dc2626'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCardColor(col)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        newCardColor === col ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
