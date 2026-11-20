import React, { useState } from 'react';
import {
  X,
  Check,
  Calendar,
  CreditCard as CreditCardIcon,
  Tag,
  DollarSign,
  Layers,
  FileText,
} from 'lucide-react';
import { Category, CreditCard, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { playSuccessSound, playTapSound } from '../utils/sound';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  cards: CreditCard[];
  initialDate?: string;
  soundEnabled: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  cards,
  initialDate,
  soundEnabled,
}) => {
  if (!isOpen) return null;

  const todayStr = initialDate || new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(todayStr);
  const [categoryId, setCategoryId] = useState(() => {
    return categories.find(c => c.type === 'needs')?.id || categories[0]?.id || '';
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [installments, setInstallments] = useState('1');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter categories according to selected type
  const availableCategories = categories.filter(c => {
    if (type === 'income') return c.type === 'income';
    return c.type !== 'income';
  });

  const handleTypeChange = (newType: TransactionType) => {
    playTapSound(soundEnabled);
    setType(newType);
    setFormError(null);
    if (newType === 'income') {
      const incCat = categories.find(c => c.type === 'income');
      if (incCat) setCategoryId(incCat.id);
      setPaymentMethod('pix');
    } else if (newType === 'credit_card') {
      const expCat = categories.find(c => c.type !== 'income');
      if (expCat) setCategoryId(expCat.id);
      setPaymentMethod('credito');
    } else {
      const expCat = categories.find(c => c.type !== 'income');
      if (expCat) setCategoryId(expCat.id);
      setPaymentMethod('pix');
    }
  };

  const addQuickAmount = (val: number) => {
    playTapSound(soundEnabled);
    const curr = parseFloat(amountStr.replace(',', '.')) || 0;
    const next = (curr + val).toFixed(2);
    setAmountStr(next);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setFormError('Por favor informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setFormError('Por favor digite uma descrição para o lançamento.');
      return;
    }

    setFormError(null);
    const isCredit = type === 'credit_card' || paymentMethod === 'credito';
    const numInstallments = parseInt(installments, 10) || 1;

    onSave({
      description: description.trim(),
      amount: cleanAmount,
      date,
      type,
      categoryId,
      paymentMethod: isCredit ? 'credito' : paymentMethod,
      cardId: isCredit ? cardId : undefined,
      status,
      notes: notes.trim() || undefined,
      installmentCurrent: isCredit && numInstallments > 1 ? 1 : undefined,
      installmentTotal: isCredit && numInstallments > 1 ? numInstallments : undefined,
    });

    playSuccessSound(soundEnabled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Novo Lançamento
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold text-xs">
              {formError}
            </div>
          )}

          {/* Type Selector (Despesa, Entrada, Cartão) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl font-bold transition text-center ${
                type === 'expense'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl font-bold transition text-center ${
                type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('credit_card')}
              className={`py-2 rounded-xl font-bold transition text-center ${
                type === 'credit_card'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cartão
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Valor do Lançamento (R$)
            </label>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl font-bold text-slate-500 dark:text-slate-400">R$</span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0,00"
                value={amountStr}
                onChange={e => {
                  setAmountStr(e.target.value);
                  if (formError) setFormError(null);
                }}
                className={`text-3xl font-extrabold bg-transparent outline-none text-center w-48 font-mono ${
                  type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : type === 'credit_card'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              />
            </div>

            {/* Quick Amount Add Pills */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {[20, 50, 100, 200, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Supermercado, Aluguel, Salário, Uber..."
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (formError) setFormError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-xs"
            />
          </div>

          {/* Category & Date in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition text-xs"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition text-xs"
              />
            </div>
          </div>

          {/* Credit Card Specific Options */}
          {type === 'credit_card' ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                <CreditCardIcon className="w-3.5 h-3.5" />
                Dados do Cartão de Crédito
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1">Qual Cartão?</label>
                  <select
                    value={cardId}
                    onChange={e => setCardId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (•• {c.lastFourDigits})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Parcelamento
                  </label>
                  <select
                    value={installments}
                    onChange={e => setInstallments(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="1">À vista (1x)</option>
                    {[2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>
                        {n}x de R${' '}
                        {amountStr && !isNaN(parseFloat(amountStr.replace(',', '.')))
                          ? (parseFloat(amountStr.replace(',', '.')) / n).toFixed(2)
                          : '0.00'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Method for Normal Expenses/Incomes */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition text-xs"
                >
                  <option value="pix">Pix</option>
                  <option value="debito">Débito</option>
                  <option value="transferencia">Transferência TED</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="dinheiro">Dinheiro Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Situação
                </label>
                <div className="flex gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setStatus('completed')}
                    className={`flex-1 py-2 rounded-xl font-bold transition text-center ${
                      status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Efetivado
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`flex-1 py-2 rounded-xl font-bold transition text-center ${
                      status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Pendente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Optional */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Observações / Detalhes (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprovante, número do pedido ou nota..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition text-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-[0_6px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition active:scale-98 mt-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            Salvar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
};
