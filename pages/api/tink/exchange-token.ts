import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Tink API configuration - secure on the server
const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID || '';
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET || '';
const TINK_API_URL = process.env.TINK_API_URL || 'https://api.tink.com';

// Create a Tink API client
const tinkClient = axios.create({
  baseURL: TINK_API_URL,
});

/**
 * Exchange an authorization code for an access token
 * This keeps the client secret secure on the server
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the code from the request body
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    // Validate that we have the required configuration
    if (!TINK_CLIENT_ID || !TINK_CLIENT_SECRET) {
      console.error('Missing Tink credentials');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Exchange the code for an access token
    const response = await tinkClient.post('/api/v1/oauth/token', null, {
      params: {
        code,
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: 'authorization_code',
      },
    });
    
    // Return the token data to the client
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid authorization code' });
    }
    
    return res.status(500).json({ message: 'Failed to exchange token' });
  }
} 