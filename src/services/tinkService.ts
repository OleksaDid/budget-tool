import axios from 'axios';

// Tink API configuration
const TINK_CLIENT_ID = process.env.REACT_APP_TINK_CLIENT_ID || '';
const TINK_CLIENT_SECRET = process.env.REACT_APP_TINK_CLIENT_SECRET || '';
const TINK_REDIRECT_URI = process.env.REACT_APP_TINK_REDIRECT_URI || '';
const TINK_API_URL = process.env.REACT_APP_TINK_API_URL || 'https://api.tink.com';
const ACTIVO_BANK_PROVIDER_ID = process.env.REACT_APP_ACTIVO_BANK_PROVIDER_ID || 'activobank-pt';

// Debug Tink configuration values
console.log('Tink Service Config:', {
  clientId: TINK_CLIENT_ID, 
  clientIdLength: TINK_CLIENT_ID.length,
  hasSecret: !!TINK_CLIENT_SECRET,
  redirectUri: TINK_REDIRECT_URI,
  apiUrl: TINK_API_URL,
  provider: ACTIVO_BANK_PROVIDER_ID
});

// Tink API Client
const tinkClient = axios.create({
  baseURL: TINK_API_URL,
});

// Add interceptor for better error logging
tinkClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Tink API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    return Promise.reject(error);
  }
);

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

/**
 * Creates a URL to link and authenticate with a bank through Tink Link
 * @param market The market code (e.g., 'PT' for Portugal)
 * @returns The URL to redirect the user to for bank authentication
 */
export const createTinkLinkUrl = (market = 'PT'): string => {
  // Validate client ID is present
  if (!TINK_CLIENT_ID) {
    console.error('Missing Tink Client ID. Check your environment variables.');
  }
  
  const tinkLinkUrl = new URL('https://link.tink.com/1.0/transactions/connect-accounts');
  
  // Add required parameters
  tinkLinkUrl.searchParams.append('client_id', TINK_CLIENT_ID);
  tinkLinkUrl.searchParams.append('redirect_uri', TINK_REDIRECT_URI);
  tinkLinkUrl.searchParams.append('market', market);
  tinkLinkUrl.searchParams.append('locale', 'en_US');
  tinkLinkUrl.searchParams.append('scope', 'transactions:read,accounts:read');
  
  // Specific provider filter for ActivoBank
  tinkLinkUrl.searchParams.append('provider', ACTIVO_BANK_PROVIDER_ID);
  
  // Log the full URL for debugging (but hide the client ID)
  const logUrl = tinkLinkUrl.toString().replace(TINK_CLIENT_ID, '[HIDDEN_CLIENT_ID]');
  console.log('Generated Tink URL:', logUrl);
  
  return tinkLinkUrl.toString();
};

/**
 * Get access token from authorization code
 * @param code The authorization code from Tink
 * @returns Promise with the access token details
 */
export const getAccessToken = async (code: string): Promise<TinkAccessToken> => {
  const response = await tinkClient.post('/api/v1/oauth/token', null, {
    params: {
      code,
      client_id: TINK_CLIENT_ID,
      client_secret: TINK_CLIENT_SECRET,
      grant_type: 'authorization_code',
    },
  });
  
  return response.data;
};

/**
 * Get user information
 * @param accessToken The Tink access token
 * @returns Promise with user information
 */
export const getUserInfo = async (accessToken: string): Promise<TinkUser> => {
  const response = await tinkClient.get('/api/v1/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  return response.data;
};

/**
 * Get transactions
 * @param accessToken The Tink access token
 * @param pageToken Optional page token for pagination
 * @returns Promise with transactions data
 */
export const getTransactions = async (
  accessToken: string, 
  pageToken?: string
): Promise<TinkTransactionsResponse> => {
  if (!accessToken) {
    throw new Error('No access token provided');
  }
  
  const params: Record<string, string> = {
    pageSize: '100',
  };
  
  if (pageToken) {
    params.pageToken = pageToken;
  }
  
  console.log('Calling Tink API to fetch transactions...');
  
  try {
    const response = await tinkClient.get('/api/v1/transactions', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transactions from Tink API:', error);
    throw error;
  }
};

/**
 * Maps Tink transactions to app Transaction format
 * @param tinkTransactions Transactions from Tink API
 * @returns Transactions in app format
 */
export const mapTinkTransactionsToAppFormat = (
  tinkTransactions: TinkTransaction[]
): any[] => {
  return tinkTransactions.map(transaction => {
    // Determine if it's income or expense based on amount
    const type = transaction.amount >= 0 ? 'income' : 'expense';
    
    return {
      id: transaction.id,
      date: transaction.date,
      amount: Math.abs(transaction.amount),
      description: transaction.description || transaction.originalDescription || 'Bank Transaction',
      categoryId: transaction.categoryId || (type === 'income' ? 'income' : 'uncategorized'),
      type,
      originalData: {
        source: 'tink',
        tinkId: transaction.id,
        accountId: transaction.accountId,
        originalDescription: transaction.originalDescription,
        status: transaction.status,
        timestamp: transaction.timestamp,
      },
    };
  });
};

const tinkService = {
  createTinkLinkUrl,
  getAccessToken,
  getUserInfo,
  getTransactions,
  mapTinkTransactionsToAppFormat,
};

export default tinkService; 