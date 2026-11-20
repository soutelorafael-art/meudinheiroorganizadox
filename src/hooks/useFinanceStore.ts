import { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, CreditCard, FinancialGoal, FinanceSettings, Transaction } from '../types/finance';
import { INITIAL_CATEGORIES, INITIAL_CARDS, INITIAL_GOALS, getInitialTransactions } from '../data/initialData';
import { getCurrentMonthKey } from '../utils/formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mdo_transactions_v1',
  CATEGORIES: 'mdo_categories_v1',
  CARDS: 'mdo_cards_v1',
  GOALS: 'mdo_goals_v1',
  SETTINGS: 'mdo_settings_v1',
};

export function useFinanceStore() {
  const currentMonth = useMemo(() => getCurrentMonthKey(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Initialize transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved transactions', e);
    }
    return getInitialTransactions(currentMonth);
  });

  // Initialize categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse categories', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Initialize credit cards
  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cards', e);
    }
    return INITIAL_CARDS;
  });

  // Initialize goals
  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse goals', e);
    }
    return INITIAL_GOALS;
  });

  // Settings
  const [settings, setSettings] = useState<FinanceSettings>(() => {
    const defaults: FinanceSettings = {
      currency: 'BRL',
      privacyMode: false,
      soundEnabled: true,
      previewDevice: 'full_responsive',
      theme: 'dark',
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = localStorage.getItem('mdo_pc_default_v2');
        if (!migrated) {
          localStorage.setItem('mdo_pc_default_v2', '1');
          return { ...defaults, ...parsed, previewDevice: 'full_responsive' };
        }
        return { ...defaults, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return defaults;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {
      console.error(e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Sync light/dark theme to <html class="dark"> and mobile status bar theme-color
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isLight = settings.theme === 'light';
    document.documentElement.classList.toggle('dark', !isLight);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', isLight ? '#ffffff' : '#0f172a');
    }
  }, [settings.theme]);

  // Actions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  const editTransaction = useCallback((updated: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTransactionStatus = useCallback((id: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      )
    );
  }, []);

  const updateCategoryBudget = useCallback((catId: string, budget: number) => {
    setCategories(prev => prev.map(c => (c.id === catId ? { ...c, budgetMonthly: budget } : c)));
  }, []);

  const addGoal = useCallback((goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const updateGoalAmount = useCallback((id: string, delta: number) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== id) return g;
        const newAmt = Math.max(0, g.currentAmount + delta);
        return { ...g, currentAmount: newAmt };
      })
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const addCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: `card_${Date.now()}`,
    };
    setCards(prev => [...prev, newCard]);
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<FinanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetToInitialData = useCallback(() => {
    const initialTx = getInitialTransactions(currentMonth);
    setTransactions(initialTx);
    setCategories(INITIAL_CATEGORIES);
    setCards(INITIAL_CARDS);
    setGoals(INITIAL_GOALS);
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  // Computed data for Selected Month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let creditCard = 0;
    let pendingIncome = 0;
    let pendingExpense = 0;

    for (const t of currentMonthTransactions) {
      if (t.type === 'income') {
        income += t.amount;
        if (t.status === 'pending') pendingIncome += t.amount;
      } else if (t.type === 'expense') {
        expense += t.amount;
        if (t.status === 'pending') pendingExpense += t.amount;
      } else if (t.type === 'credit_card') {
        creditCard += t.amount;
      }
    }

    const totalOutflow = expense + creditCard;
    const netBalance = income - totalOutflow;
    const savingsRate = income > 0 ? ((income - totalOutflow) / income) * 100 : 0;

    return {
      income,
      expense,
      creditCard,
      totalOutflow,
      netBalance,
      savingsRate,
      pendingIncome,
      pendingExpense,
    };
  }, [currentMonthTransactions]);

  // Category breakdown for selected month
  const categorySpending = useMemo(() => {
    const spendingMap: Record<string, number> = {};
    for (const t of currentMonthTransactions) {
      if (t.type === 'expense' || t.type === 'credit_card') {
        spendingMap[t.categoryId] = (spendingMap[t.categoryId] || 0) + t.amount;
      }
    }

    return categories
      .filter(c => c.type !== 'income')
      .map(cat => {
        const spent = spendingMap[cat.id] || 0;
        const percentage = cat.budgetMonthly > 0 ? (spent / cat.budgetMonthly) * 100 : 0;
        return {
          ...cat,
          spent,
          percentage,
          remaining: cat.budgetMonthly - spent,
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [currentMonthTransactions, categories]);

  // 50-30-20 rule stats
  const rule503020 = useMemo(() => {
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = 0;

    for (const t of currentMonthTransactions) {
      if (t.type === 'expense' || t.type === 'credit_card') {
        const cat = categories.find(c => c.id === t.categoryId);
        if (cat) {
          if (cat.type === 'needs') needsSpent += t.amount;
          else if (cat.type === 'wants') wantsSpent += t.amount;
          else if (cat.type === 'savings') savingsSpent += t.amount;
        }
      }
    }

    const income = monthlyTotals.income || 1; // avoid / 0
    return {
      needs: {
        spent: needsSpent,
        ideal: income * 0.5,
        percent: (needsSpent / income) * 100,
        targetPercent: 50,
      },
      wants: {
        spent: wantsSpent,
        ideal: income * 0.3,
        percent: (wantsSpent / income) * 100,
        targetPercent: 30,
      },
      savings: {
        spent: savingsSpent,
        ideal: income * 0.2,
        percent: (savingsSpent / income) * 100,
        targetPercent: 20,
      },
    };
  }, [currentMonthTransactions, categories, monthlyTotals.income]);

  // Annual Overview Data (Jan - Dec of the selected year)
  const annualSummary = useMemo(() => {
    const selectedYear = selectedMonth.split('-')[0];
    const monthKeys = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      return `${selectedYear}-${m}`;
    });

    const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let totalYearIncome = 0;
    let totalYearExpense = 0;

    const monthsData = monthKeys.map((mk, idx) => {
      const txs = transactions.filter(t => t.date.startsWith(mk));
      let inc = 0;
      let exp = 0;
      for (const t of txs) {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount; // includes expense & credit card
      }
      const net = inc - exp;
      totalYearIncome += inc;
      totalYearExpense += exp;
      return {
        monthKey: mk,
        label: monthNamesShort[idx],
        income: inc,
        expense: exp,
        net,
        savingsRate: inc > 0 ? (net / inc) * 100 : 0,
      };
    });

    const totalYearNet = totalYearIncome - totalYearExpense;
    const overallSavingsRate = totalYearIncome > 0 ? (totalYearNet / totalYearIncome) * 100 : 0;

    return {
      year: selectedYear,
      months: monthsData,
      totalIncome: totalYearIncome,
      totalExpense: totalYearExpense,
      totalNet: totalYearNet,
      overallSavingsRate,
    };
  }, [transactions, selectedMonth]);

  // Card details with calculated current invoices
  const cardsWithInvoices = useMemo(() => {
    return cards.map(card => {
      const cardTransactions = currentMonthTransactions.filter(
        t => t.type === 'credit_card' && t.cardId === card.id
      );
      const currentInvoiceTotal = cardTransactions.reduce((acc, t) => acc + t.amount, 0);
      const availableLimit = Math.max(0, card.limit - currentInvoiceTotal);
      const limitUsedPercent = (currentInvoiceTotal / card.limit) * 100;

      return {
        ...card,
        currentInvoiceTotal,
        availableLimit,
        limitUsedPercent,
        transactionCount: cardTransactions.length,
      };
    });
  }, [cards, currentMonthTransactions]);

  // Export functions
  const exportDataAsJSON = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      cards,
      goals,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-dinheiro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, cards, goals, settings]);

  const exportDataAsCSV = useCallback(() => {
    const headers = ['ID', 'Data', 'Tipo', 'Descricao', 'Valor', 'Categoria', 'FormaPagamento', 'Status', 'Cartao', 'Notas'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || t.categoryId;
      const card = cards.find(c => c.id === t.cardId)?.name || '';
      return [
        t.id,
        t.date,
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
        `"${cat}"`,
        t.paymentMethod,
        t.status,
        `"${card}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-dinheiro-lancamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, cards]);

  const importDataFromJSON = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      if (parsed.cards && Array.isArray(parsed.cards)) {
        setCards(parsed.cards);
      }
      if (parsed.goals && Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, []);

  return {
    selectedMonth,
    setSelectedMonth,
    transactions,
    currentMonthTransactions,
    categories,
    cards,
    cardsWithInvoices,
    goals,
    settings,
    monthlyTotals,
    categorySpending,
    rule503020,
    annualSummary,
    addTransaction,
    editTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    updateCategoryBudget,
    addGoal,
    updateGoalAmount,
    deleteGoal,
    addCard,
    deleteCard,
    updateSettings,
    resetToInitialData,
    exportDataAsJSON,
    exportDataAsCSV,
    importDataFromJSON,
  };
}

export type FinanceStore = ReturnType<typeof useFinanceStore>;
