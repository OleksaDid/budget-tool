export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  originalData?: any; // Used for imported transactions
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

// Types related to environment variables
export interface EnvVars {
  // Public environment variables
  NEXT_PUBLIC_APP_NAME: string;
} 