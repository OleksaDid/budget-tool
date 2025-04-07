import React, { useState, useEffect } from 'react';
import { Container, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetProvider } from './context/BudgetContext';
import { TinkProvider } from './context/TinkContext';
import Layout from './components/Layout';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import OfflineNotification from './components/OfflineNotification';

// Note: This file is not used in the Next.js version of the app
// It's kept for reference only. The functionality has been moved to pages/_app.tsx

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' && 
    localStorage.getItem('darkMode') === 'true' || prefersDarkMode
  );

  // Effect to initialize dark mode from system preference or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null && prefersDarkMode) {
      setDarkMode(true);
      localStorage.setItem('darkMode', 'true');
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

  // This component is no longer used in the Next.js version
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={theme}>
        <BudgetProvider>
          <TinkProvider>
            <Layout>
              <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Routes have been moved to pages/ */}
                <div>See pages/ directory for routes</div>
              </Container>
              
              {/* iOS PWA Install Prompt */}
              <IOSInstallPrompt />
              
              {/* Offline Status Notification */}
              <OfflineNotification />
            </Layout>
          </TinkProvider>
        </BudgetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;