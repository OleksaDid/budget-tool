import axios from 'axios';
import { TinkTransaction, TinkAccessToken } from '../context/TinkContext';

/**
 * Creates a URL to link and authenticate with a bank through Tink Link
 * @param market The market code (e.g., 'PT' for Portugal)
 * @returns Promise with the URL to redirect the user to for bank authentication
 */
export const createTinkLinkUrl = async (market = 'PT'): Promise<string> => {
  try {
    const response = await axios.post('/api/tink/create-link', { market });
    return response.data.url;
  } catch (error) {
    console.error('Error creating Tink link:', error);
    throw error;
  }
};

/**
 * Get access token from authorization code
 * @param code The authorization code from Tink
 * @returns Promise with the access token details
 */
export const getAccessToken = async (code: string): Promise<TinkAccessToken> => {
  try {
    const response = await axios.post('/api/tink/exchange-token', { code });
    return response.data;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
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
) => {
  try {
    const params: Record<string, string> = {};
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    const response = await axios.get('/api/tink/transactions', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
  getTransactions,
  mapTinkTransactionsToAppFormat,
};

export default tinkService; 