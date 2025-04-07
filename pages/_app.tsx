import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetProvider } from '../context/BudgetContext';
import { TinkProvider } from '../context/TinkContext';
import Layout from '../components/Layout';

// Create a client for React Query
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Effect to initialize dark mode from system preference or localStorage
  useEffect(() => {
    // First mount
    setMounted(true);
    
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true' || (savedMode === null && prefersDarkMode)) {
      setDarkMode(true);
    }
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#388e3c',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Fix for hydration mismatch with dark mode
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Budget Tool</title>
        <meta name="description" content="A budget tracking progressive web app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content={darkMode ? '#121212' : '#ffffff'} />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="Budget Tool" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Budget Tool" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BudgetProvider>
            <TinkProvider>
              <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                <Component {...pageProps} />
              </Layout>
            </TinkProvider>
          </BudgetProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp; 