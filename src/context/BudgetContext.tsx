import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, Budget, BudgetContextType } from '../types';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Default categories
const defaultCategories: Category[] = [
  { id: uuidv4(), name: 'Salary', color: '#4caf50', type: 'income' },
  { id: uuidv4(), name: 'Groceries', color: '#f44336', type: 'expense' },
  { id: uuidv4(), name: 'Transportation', color: '#2196f3', type: 'expense' },
  { id: uuidv4(), name: 'Entertainment', color: '#ff9800', type: 'expense' },
  { id: uuidv4(), name: 'Housing', color: '#9c27b0', type: 'expense' },
];

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    const storedCategories = localStorage.getItem('categories');
    const storedBudgets = localStorage.getItem('budgets');

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      // Initialize with default categories if none exist
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }

    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
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
    // Remove category and all transactions associated with it
    setCategories(categories.filter((category) => category.id !== id));
    setTransactions(transactions.filter((transaction) => transaction.categoryId !== id));
    setBudgets(budgets.filter((budget) => budget.categoryId !== id));
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

  // Utility functions
  const getTotalIncome = () => {
    return transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
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

  return (
    <BudgetContext.Provider
      value={{
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
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook to use the budget context
export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}; 