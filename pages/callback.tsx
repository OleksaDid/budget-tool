import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useTink } from '../context/TinkContext';

export default function TinkCallback() {
  const router = useRouter();
  const { handleCallback } = useTink();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the code from URL query parameters
        const { code, error: errorMsg, error_description: errorDescription } = router.query;
        
        // Log all query parameters for debugging
        console.log('TinkCallback URL params:', {
          code: typeof code === 'string' ? `${code.substring(0, 5)}...` : null, // Don't log the full code for security
          error: errorMsg,
          errorDescription,
          allParams: router.query
        });
        
        if (errorMsg) {
          setError(`Error from Tink: ${errorMsg}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }
        
        if (!code || typeof code !== 'string') {
          setError('No authorization code found in the URL');
          setLoading(false);
          return;
        }
        
        // Exchange the code for an access token
        await handleCallback(code);
        
        // Redirect to transactions page after successful authentication
        router.push('/transactions');
      } catch (err) {
        console.error('Error processing Tink callback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    if (router.isReady) {
      processCallback();
    }
  }, [router.isReady, router.query, handleCallback, router]);

  const handleRetry = () => {
    router.push('/transactions');
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ mb: 2, maxWidth: '600px' }}>
            Error connecting to your bank: {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRetry}
            sx={{ mt: 2 }}
          >
            Go Back to Transactions
          </Button>
        </>
      ) : (
        <>
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h6">
            Connecting to your bank account...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Please do not close this page. You'll be redirected shortly.
          </Typography>
        </>
      )}
    </Box>
  );
} 