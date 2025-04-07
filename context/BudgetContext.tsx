import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, Budget } from '../types';
import { saveToStorage, loadFromStorage } from '../services/storage';

// Default categories
const defaultCategories: Category[] = [
  { id: 'salary', name: 'Salary', color: '#4CAF50', type: 'income' },
  { id: 'business', name: 'Business', color: '#8BC34A', type: 'income' },
  { id: 'investment', name: 'Investment', color: '#009688', type: 'income' },
  { id: 'other-income', name: 'Other Income', color: '#00BCD4', type: 'income' },
  
  { id: 'housing', name: 'Housing', color: '#F44336', type: 'expense' },
  { id: 'food', name: 'Food', color: '#FF5722', type: 'expense' },
  { id: 'transportation', name: 'Transportation', color: '#FF9800', type: 'expense' },
  { id: 'utilities', name: 'Utilities', color: '#FFC107', type: 'expense' },
  { id: 'insurance', name: 'Insurance', color: '#9C27B0', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', color: '#E91E63', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', color: '#673AB7', type: 'expense' },
  { id: 'shopping', name: 'Shopping', color: '#3F51B5', type: 'expense' },
  { id: 'personal', name: 'Personal', color: '#2196F3', type: 'expense' },
  { id: 'debt', name: 'Debt', color: '#607D8B', type: 'expense' },
  { id: 'savings', name: 'Savings', color: '#795548', type: 'expense' },
  { id: 'other-expense', name: 'Other Expense', color: '#9E9E9E', type: 'expense' },
];

interface BudgetContextType {
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

interface BudgetProviderProps {
  children: ReactNode;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side

    const storedTransactions = loadFromStorage<Transaction[]>('transactions', []);
    const storedCategories = loadFromStorage<Category[]>('categories', []);
    const storedBudgets = loadFromStorage<Budget[]>('budgets', []);

    if (storedTransactions.length > 0) {
      setTransactions(storedTransactions);
    }

    if (storedCategories.length > 0) {
      setCategories(storedCategories);
    } else {
      // Initialize with default categories if none exist
      saveToStorage('categories', defaultCategories);
    }

    if (storedBudgets.length > 0) {
      setBudgets(storedBudgets);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    saveToStorage('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    saveToStorage('categories', categories);
  }, [categories]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    saveToStorage('budgets', budgets);
  }, [budgets]);

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };

  // Category functions
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updatedCategory: Partial<Category>) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  // Budget functions
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, updatedBudget: Partial<Budget>) => {
    setBudgets(
      budgets.map((budget) =>
        budget.id === id ? { ...budget, ...updatedBudget } : budget
      )
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== id));
  };

  // Calculation functions
  const getTotalIncome = () => {
    return transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const getTransactionsByCategory = (categoryId: string) => {
    return transactions.filter((transaction) => transaction.categoryId === categoryId);
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  const value: BudgetContextType = {
    transactions,
    categories,
    budgets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getTransactionsByCategory,
    getCategoryById,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export default BudgetContext; 