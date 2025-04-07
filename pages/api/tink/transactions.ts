import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Tink API configuration - secure on the server
const TINK_API_URL = process.env.TINK_API_URL || 'https://api.tink.com';

// Create a Tink API client
const tinkClient = axios.create({
  baseURL: TINK_API_URL,
});

/**
 * Fetch transactions from Tink
 * The token is passed from the client but all API communication is server-side
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    // Get pagination parameters
    const { pageToken } = req.query;
    
    const params: Record<string, string> = {
      pageSize: '100',
    };
    
    if (pageToken && typeof pageToken === 'string') {
      params.pageToken = pageToken;
    }
    
    // Fetch transactions from Tink
    const response = await tinkClient.get('/api/v1/transactions', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    
    // Return the transactions to the client
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching transactions:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }
    
    return res.status(500).json({ message: 'Failed to fetch transactions' });
  }
} 