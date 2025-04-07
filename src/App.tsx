import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import OfflineNotification from './components/OfflineNotification';
import { BudgetProvider } from './context/BudgetContext';
import { TinkProvider } from './context/TinkContext';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import TinkCallback from './pages/TinkCallback';

// Create a client for React Query
const queryClient = new QueryClient();

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || prefersDarkMode
  );

  // Effect to initialize dark mode from system preference or localStorage
  useEffect(() => {
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BudgetProvider>
          <TinkProvider>
            <Layout>
              <Container maxWidth="lg" sx={{ py: 3 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/settings" element={<Settings toggleDarkMode={toggleDarkMode} darkMode={darkMode} />} />
                  <Route path="/callback" element={<TinkCallback />} />
                  <Route path="/tink-callback" element={<TinkCallback />} />
                </Routes>
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