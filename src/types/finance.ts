export type TransactionType = 'income' | 'expense' | 'credit_card';

export type PaymentMethod = 'pix' | 'debito' | 'credito' | 'dinheiro' | 'boleto' | 'transferencia';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending';
  notes?: string;
  cardId?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export type CategoryType = 'needs' | 'wants' | 'savings' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetMonthly: number;
  type: CategoryType; // 50-30-20 rule classification
}

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  limit: number;
  closingDay: number; // dia de fechamento
  dueDay: number; // dia de vencimento
  brandColor: string;
  bank: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'emergency' | 'travel' | 'purchase' | 'investment' | 'education';
  icon: string;
  color: string;
}

export interface FinanceSettings {
  currency: string;
  privacyMode: boolean; // hide values with asterisks
  soundEnabled: boolean;
  previewDevice: 'mobile_mockup' | 'full_responsive';
  theme: 'dark' | 'light';
}
