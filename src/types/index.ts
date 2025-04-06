export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface BudgetContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getCategoryById: (id: string) => Category | undefined;
} 