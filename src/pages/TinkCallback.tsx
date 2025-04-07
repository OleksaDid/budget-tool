import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useTink } from '../context/TinkContext';

const TinkCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, refreshTransactions } = useTink();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the code from URL query parameters
        const code = searchParams.get('code');
        const errorMsg = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Log all query parameters for debugging
        console.log('TinkCallback URL params:', {
          code: code ? `${code.substring(0, 5)}...` : null, // Don't log the full code for security
          error: errorMsg,
          errorDescription,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (errorMsg) {
          setError(`Error from Tink: ${errorMsg}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }
        
        if (!code) {
          setError('No authorization code found in the URL');
          setLoading(false);
          return;
        }
        
        // Exchange the code for an access token
        await handleCallback(code);
        
        // Manually refresh transactions
        await refreshTransactions();
        
        // Redirect to transactions page after successful authentication
        navigate('/transactions');
      } catch (err) {
        console.error('Error processing Tink callback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate, refreshTransactions]);

  const handleRetry = () => {
    window.location.href = '/transactions';
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
};

export default TinkCallback; 