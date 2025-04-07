import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { saveToStorage, loadFromStorage } from '../services/storage';

// Types for Tink API responses
export interface TinkUser {
  id: string;
  created: string;
  updated: string;
}

export interface TinkAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_hint: string;
}

export interface TinkTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  categoryCode?: string;
  categoryId?: string;
  categoryType?: string;
  originalDescription?: string;
  status: string;
  timestamp: string;
  counterparty?: string;
  tinkId: string;
}

export interface TinkTransactionsResponse {
  transactions: TinkTransaction[];
  nextPageToken?: string;
}

interface TinkContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  error: Error | null;
  tinkTransactions: TinkTransaction[];
  connectToTink: () => Promise<void>;
  disconnectFromTink: () => void;
  handleCallback: (code: string) => Promise<TinkAccessToken | void>;
  refreshTransactions: () => Promise<void>;
}

interface TinkProviderProps {
  children: React.ReactNode;
}

const TinkContext = createContext<TinkContextType | undefined>(undefined);

const TINK_ACCESS_TOKEN_KEY = 'tink_access_token';

export const TinkProvider: React.FC<TinkProviderProps> = ({ children }) => {
  // Load token from storage with debugging
  const savedToken = loadFromStorage<string | null>(TINK_ACCESS_TOKEN_KEY, null);
  console.log('Initial load of Tink access token:', savedToken ? 'Token exists' : 'No token found');
  
  const [accessToken, setAccessToken] = useState<string | null>(savedToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use React Query to fetch and cache transactions
  const {
    data: tinkTransactions = [],
    refetch: refetchTransactions,
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['tinkTransactions', accessToken],
    queryFn: async () => {
      if (!accessToken) return [];
      
      try {
        console.log('Fetching transactions with token (first few chars):', accessToken.substring(0, 10) + '...');
        
        // Fetch transactions from our Next.js API endpoint instead of directly from Tink
        const response = await axios.get('/api/tink/transactions', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log(`Fetched ${response.data.transactions?.length || 0} transactions`);
        return response.data.transactions || [];
      } catch (err) {
        console.error('Error fetching Tink transactions:', err);
        // If the token is expired or invalid, clear it
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.log('Token expired or invalid, disconnecting');
          disconnectFromTink();
        }
        throw err;
      }
    },
    enabled: !!accessToken, // Only run the query if we have an access token
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once on failure
  });

  useEffect(() => {
    // Store access token in localStorage whenever it changes
    if (accessToken) {
      console.log('Saving access token to storage (first few chars):', accessToken.substring(0, 10) + '...');
      saveToStorage(TINK_ACCESS_TOKEN_KEY, accessToken);
    } else if (accessToken === null) {
      console.log('Clearing access token from storage');
      saveToStorage(TINK_ACCESS_TOKEN_KEY, null);
    }
  }, [accessToken]);

  // Force refreshing transactions when access token is set
  useEffect(() => {
    if (accessToken && tinkTransactions.length === 0) {
      console.log('Token exists but no transactions, refreshing data');
      refreshTransactions();
    }
  }, [accessToken]);

  const connectToTink = async () => {
    console.log('Connecting to Tink...');
    try {
      setIsLoading(true);
      
      // Get the Tink Link URL from our Next.js API
      const response = await axios.post('/api/tink/create-link', { market: 'PT' });
      
      // Redirect to Tink
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error creating Tink link:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect to Tink'));
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromTink = () => {
    console.log('Disconnecting from Tink');
    setAccessToken(null);
    saveToStorage(TINK_ACCESS_TOKEN_KEY, null);
  };

  const handleCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Exchanging authorization code for access token');
      
      // Exchange code for access token using our Next.js API
      const response = await axios.post('/api/tink/exchange-token', { code });
      const tokenData = response.data;
      
      console.log('Received access token (first few chars):', tokenData.access_token.substring(0, 10) + '...');
      setAccessToken(tokenData.access_token);
      return tokenData;
    } catch (err) {
      console.error('Error handling Tink callback:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!accessToken) {
      console.warn('Cannot refresh transactions: No access token');
      return;
    }
    
    try {
      console.log('Manually refreshing transactions...');
      await refetchTransactions();
    } catch (err) {
      console.error('Error refreshing transactions:', err);
    }
  };

  const contextValue: TinkContextType = {
    isAuthenticated: !!accessToken,
    accessToken,
    isLoading: isLoading || isLoadingTransactions,
    error,
    tinkTransactions: tinkTransactions || [],
    connectToTink,
    disconnectFromTink,
    handleCallback,
    refreshTransactions,
  };

  return (
    <TinkContext.Provider value={contextValue}>
      {children}
    </TinkContext.Provider>
  );
};

export const useTink = (): TinkContextType => {
  const context = useContext(TinkContext);
  
  if (context === undefined) {
    throw new Error('useTink must be used within a TinkProvider');
  }
  
  return context;
};

export default TinkContext; 