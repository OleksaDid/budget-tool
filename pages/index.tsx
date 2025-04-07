import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid as MuiGrid,
} from '@mui/material';
import Head from 'next/head';

// Create a Grid component that works with both item and container
const Grid = MuiGrid;

// Dashboard component that will be migrated further
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Budget Tool</title>
      </Head>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to your budget dashboard. This page will show your financial overview.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="primary" variant="h6">
                  Income
                </Typography>
                <Typography variant="h4">
                  $0.00
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="error" variant="h6">
                  Expenses
                </Typography>
                <Typography variant="h4">
                  $0.00
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="secondary" variant="h6">
                  Balance
                </Typography>
                <Typography variant="h4">
                  $0.00
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Next Steps
              </Typography>
              <Typography variant="body1">
                This Dashboard is a placeholder. You'll need to migrate the existing Dashboard component from the React app to this Next.js app.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
} 