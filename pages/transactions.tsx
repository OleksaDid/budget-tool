import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import Head from 'next/head';
import { useTink } from '../context/TinkContext';

export default function TransactionsPage() {
  const { 
    isAuthenticated, 
    connectToTink, 
    isLoading, 
    error, 
    tinkTransactions 
  } = useTink();

  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectToTink();
    } catch (err) {
      console.error('Failed to connect:', err);
      setConnecting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Transactions - Budget Tool</title>
      </Head>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transactions
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Manage your transactions or connect to your bank.
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bank Connection
            </Typography>
            
            {isAuthenticated ? (
              <Typography>
                Your bank account is connected. You have {tinkTransactions.length} transactions.
              </Typography>
            ) : (
              <Box>
                <Typography sx={{ mb: 2 }}>
                  Connect to your bank to import transactions automatically.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect Bank Account'}
                </Button>
              </Box>
            )}
          </Paper>
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message}
            </Alert>
          )}
          
          {isAuthenticated && tinkTransactions.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bank Transactions
              </Typography>
              <Typography>
                You have {tinkTransactions.length} transactions imported from your bank.
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                This page needs to be migrated from the React app to display the transactions.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
} 