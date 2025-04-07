import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import tinkService, { TinkTransaction, TinkAccessToken } from '../services/tinkService';
import { saveToStorage, loadFromStorage } from '../services/storage';

// Debug Tink configuration
console.log('Tink config:', {
  clientId: process.env.REACT_APP_TINK_CLIENT_ID,
  redirectUri: process.env.REACT_APP_TINK_REDIRECT_URI,
  apiUrl: process.env.REACT_APP_TINK_API_URL,
  providerId: process.env.REACT_APP_ACTIVO_BANK_PROVIDER_ID
});

interface TinkContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  error: Error | null;
  tinkTransactions: TinkTransaction[];
  connectToTink: () => void;
  disconnectFromTink: () => void;
  handleCallback: (code: string) => Promise<TinkAccessToken | void>;
  refreshTransactions: () => void;
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
    refetch: refreshTransactions,
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['tinkTransactions', accessToken],
    queryFn: async () => {
      if (!accessToken) return [];
      
      try {
        console.log('Fetching transactions with token:', accessToken.substring(0, 10) + '...');
        // Fetch transactions from Tink
        const response = await tinkService.getTransactions(accessToken);
        
        console.log(`Fetched ${response.transactions.length} transactions from Tink`);
        // Process and return the transactions
        return response.transactions;
      } catch (err) {
        console.error('Error fetching Tink transactions:', err);
        // If the token is expired or invalid, clear it
        if (err instanceof Error && err.message.includes('401')) {
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
      console.log('Saving access token to storage:', accessToken.substring(0, 10) + '...');
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
  }, [accessToken, tinkTransactions.length, refreshTransactions]);

  const connectToTink = () => {
    console.log('Connecting to Tink...');
    // Create and redirect to Tink Link URL
    const tinkLinkUrl = tinkService.createTinkLinkUrl();
    window.location.href = tinkLinkUrl;
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
      // Exchange code for access token
      const tokenData = await tinkService.getAccessToken(code);
      console.log('Received access token:', tokenData.access_token.substring(0, 10) + '...');
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

  const contextValue: TinkContextType = {
    isAuthenticated: !!accessToken,
    accessToken,
    isLoading: isLoading || isLoadingTransactions,
    error,
    tinkTransactions,
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