import { Category, CreditCard, FinancialGoal, Transaction } from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  // Necessidades (50%)
  { id: 'cat_moradia', name: 'Moradia & Contas', icon: 'Home', color: '#3b82f6', budgetMonthly: 1800, type: 'needs' },
  { id: 'cat_alimentacao', name: 'Alimentação & Mercado', icon: 'ShoppingCart', color: '#10b981', budgetMonthly: 1200, type: 'needs' },
  { id: 'cat_transporte', name: 'Transporte & Combustível', icon: 'Car', color: '#f59e0b', budgetMonthly: 450, type: 'needs' },
  { id: 'cat_saude', name: 'Saúde & Farmácia', icon: 'Activity', color: '#ef4444', budgetMonthly: 300, type: 'needs' },
  
  // Desejos / Estilo de Vida (30%)
  { id: 'cat_lazer', name: 'Lazer & Restaurantes', icon: 'Utensils', color: '#ec4899', budgetMonthly: 600, type: 'wants' },
  { id: 'cat_compras', name: 'Compras & Vestuário', icon: 'ShoppingBag', color: '#8b5cf6', budgetMonthly: 400, type: 'wants' },
  { id: 'cat_assinaturas', name: 'Assinaturas & Streaming', icon: 'Tv', color: '#06b6d4', budgetMonthly: 150, type: 'wants' },
  { id: 'cat_educacao', name: 'Educação & Livros', icon: 'BookOpen', color: '#14b8a6', budgetMonthly: 250, type: 'wants' },

  // Poupança & Investimentos (20%)
  { id: 'cat_investimentos', name: 'Investimentos & Reserva', icon: 'TrendingUp', color: '#10b981', budgetMonthly: 1300, type: 'savings' },

  // Entradas
  { id: 'cat_salario', name: 'Salário Principal', icon: 'Briefcase', color: '#10b981', budgetMonthly: 5500, type: 'income' },
  { id: 'cat_extra', name: 'Renda Extra & Freela', icon: 'Coins', color: '#38bdf8', budgetMonthly: 800, type: 'income' },
  { id: 'cat_proventos', name: 'Dividendos & Rendimentos', icon: 'PieChart', color: '#a855f7', budgetMonthly: 150, type: 'income' },
];

export const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'card_nubank',
    name: 'Nubank Ultravioleta',
    lastFourDigits: '8492',
    limit: 8500,
    closingDay: 5,
    dueDay: 12,
    brandColor: '#820ad1',
    bank: 'Nubank',
  },
  {
    id: 'card_itau',
    name: 'Itaú Black Visa',
    lastFourDigits: '4105',
    limit: 15000,
    closingDay: 20,
    dueDay: 28,
    brandColor: '#ff6200',
    bank: 'Itaú',
  },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal_reserva',
    title: 'Reserva de Emergência (6 meses)',
    targetAmount: 24000,
    currentAmount: 16800,
    deadline: '2027-06-30',
    category: 'emergency',
    icon: 'ShieldCheck',
    color: '#10b981',
  },
  {
    id: 'goal_viagem',
    title: 'Viagem de Férias (Praia)',
    targetAmount: 6000,
    currentAmount: 3850,
    deadline: '2027-01-15',
    category: 'travel',
    icon: 'Palmtree',
    color: '#06b6d4',
  },
  {
    id: 'goal_macbook',
    title: 'Notebook para Trabalho',
    targetAmount: 8500,
    currentAmount: 5100,
    deadline: '2026-12-20',
    category: 'purchase',
    icon: 'Laptop',
    color: '#8b5cf6',
  },
];

export function getInitialTransactions(currentMonthKey: string): Transaction[] {
  // Generate sample realistic transactions for current month and previous month
  const [year, month] = currentMonthKey.split('-');
  
  return [
    // Rendas do Mês
    {
      id: 'tx_inc_1',
      description: 'Salário Mensal CLT',
      amount: 5500,
      date: `${year}-${month}-05`,
      type: 'income',
      categoryId: 'cat_salario',
      paymentMethod: 'transferencia',
      status: 'completed',
      notes: 'Empresa Tecnologia S.A.',
    },
    {
      id: 'tx_inc_2',
      description: 'Projeto Freelance Design UI',
      amount: 950,
      date: `${year}-${month}-10`,
      type: 'income',
      categoryId: 'cat_extra',
      paymentMethod: 'pix',
      status: 'completed',
      notes: 'Consultoria app mobile',
    },
    {
      id: 'tx_inc_3',
      description: 'Rendimento CDB 110% CDI',
      amount: 142.80,
      date: `${year}-${month}-15`,
      type: 'income',
      categoryId: 'cat_proventos',
      paymentMethod: 'transferencia',
      status: 'completed',
    },

    // Despesas Essenciais
    {
      id: 'tx_exp_1',
      description: 'Aluguel do Apartamento',
      amount: 1450,
      date: `${year}-${month}-06`,
      type: 'expense',
      categoryId: 'cat_moradia',
      paymentMethod: 'pix',
      status: 'completed',
    },
    {
      id: 'tx_exp_2',
      description: 'Condomínio + Água',
      amount: 420,
      date: `${year}-${month}-08`,
      type: 'expense',
      categoryId: 'cat_moradia',
      paymentMethod: 'boleto',
      status: 'completed',
    },
    {
      id: 'tx_exp_3',
      description: 'Supermercado Pão de Açúcar (Mês)',
      amount: 720.50,
      date: `${year}-${month}-07`,
      type: 'expense',
      categoryId: 'cat_alimentacao',
      paymentMethod: 'debito',
      status: 'completed',
    },
    {
      id: 'tx_exp_4',
      description: 'Energia Elétrica (Enel)',
      amount: 185.30,
      date: `${year}-${month}-11`,
      type: 'expense',
      categoryId: 'cat_moradia',
      paymentMethod: 'pix',
      status: 'completed',
    },
    {
      id: 'tx_exp_5',
      description: 'Internet Fibra 600 Mega',
      amount: 119.90,
      date: `${year}-${month}-12`,
      type: 'expense',
      categoryId: 'cat_moradia',
      paymentMethod: 'debito',
      status: 'completed',
    },
    {
      id: 'tx_exp_6',
      description: 'Combustível Posto Shell',
      amount: 220,
      date: `${year}-${month}-09`,
      type: 'expense',
      categoryId: 'cat_transporte',
      paymentMethod: 'debito',
      status: 'completed',
    },
    {
      id: 'tx_exp_7',
      description: 'Plano de Saúde Unimed',
      amount: 280,
      date: `${year}-${month}-14`,
      type: 'expense',
      categoryId: 'cat_saude',
      paymentMethod: 'boleto',
      status: 'completed',
    },

    // Cartão de Crédito
    {
      id: 'tx_card_1',
      description: 'Jantar Restaurante Italiano',
      amount: 175.40,
      date: `${year}-${month}-04`,
      type: 'credit_card',
      categoryId: 'cat_lazer',
      paymentMethod: 'credito',
      cardId: 'card_nubank',
      status: 'completed',
    },
    {
      id: 'tx_card_2',
      description: 'Netflix + Spotify Duo',
      amount: 79.80,
      date: `${year}-${month}-02`,
      type: 'credit_card',
      categoryId: 'cat_assinaturas',
      paymentMethod: 'credito',
      cardId: 'card_nubank',
      status: 'completed',
    },
    {
      id: 'tx_card_3',
      description: 'Tênis Corrida Nike (Parcela 2/5)',
      amount: 129.90,
      date: `${year}-${month}-03`,
      type: 'credit_card',
      categoryId: 'cat_compras',
      paymentMethod: 'credito',
      cardId: 'card_nubank',
      installmentCurrent: 2,
      installmentTotal: 5,
      status: 'completed',
    },
    {
      id: 'tx_card_4',
      description: 'iFood Entrega Hambúrguer',
      amount: 68.50,
      date: `${year}-${month}-10`,
      type: 'credit_card',
      categoryId: 'cat_lazer',
      paymentMethod: 'credito',
      cardId: 'card_nubank',
      status: 'completed',
    },
    {
      id: 'tx_card_5',
      description: 'Passagem Aérea Férias (Parcela 3/6)',
      amount: 340.00,
      date: `${year}-${month}-01`,
      type: 'credit_card',
      categoryId: 'cat_lazer',
      paymentMethod: 'credito',
      cardId: 'card_itau',
      installmentCurrent: 3,
      installmentTotal: 6,
      status: 'completed',
    },

    // Aporte Financeiro do Mês
    {
      id: 'tx_sav_1',
      description: 'Aporte Tesouro Selic 2029',
      amount: 800,
      date: `${year}-${month}-06`,
      type: 'expense',
      categoryId: 'cat_investimentos',
      paymentMethod: 'pix',
      status: 'completed',
      notes: 'Destinado à Reserva de Emergência',
    },
  ];
}
