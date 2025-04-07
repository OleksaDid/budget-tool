import { NextApiRequest, NextApiResponse } from 'next';

// Tink API configuration - now secure on the server
const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID || '';
const TINK_REDIRECT_URI = process.env.TINK_REDIRECT_URI || '';
const TINK_API_URL = process.env.TINK_API_URL || 'https://api.tink.com';
const ACTIVO_BANK_PROVIDER_ID = process.env.ACTIVO_BANK_PROVIDER_ID || 'activobank-pt';

/**
 * API endpoint to create a Tink link URL
 * This keeps client credentials secure on the server
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate that we have the required configuration
    if (!TINK_CLIENT_ID) {
      console.error('Missing Tink Client ID');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Get the market from the request or use default (PT for Portugal)
    const { market = 'PT' } = req.body;

    // Create the Tink Link URL
    const tinkLinkUrl = new URL('https://link.tink.com/1.0/transactions/connect-accounts');
    
    // Add required parameters
    tinkLinkUrl.searchParams.append('client_id', TINK_CLIENT_ID);
    tinkLinkUrl.searchParams.append('redirect_uri', TINK_REDIRECT_URI);
    tinkLinkUrl.searchParams.append('market', market);
    tinkLinkUrl.searchParams.append('locale', 'en_US');
    tinkLinkUrl.searchParams.append('scope', 'transactions:read,accounts:read');
    
    // Specific provider filter for ActivoBank
    tinkLinkUrl.searchParams.append('provider', ACTIVO_BANK_PROVIDER_ID);
    
    // Log the URL for debugging (but hide the client ID)
    const logUrl = tinkLinkUrl.toString().replace(TINK_CLIENT_ID, '[HIDDEN_CLIENT_ID]');
    console.log('Generated Tink URL:', logUrl);
    
    // Return the URL to the client
    return res.status(200).json({ url: tinkLinkUrl.toString() });
  } catch (error) {
    console.error('Error creating Tink link:', error);
    return res.status(500).json({ message: 'Failed to create Tink link' });
  }
} 