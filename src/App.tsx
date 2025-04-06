import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import OfflineNotification from './components/OfflineNotification';
import { BudgetProvider } from './context/BudgetContext';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

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
    <ThemeProvider theme={theme}>
      <BudgetProvider>
        <Layout>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings toggleDarkMode={toggleDarkMode} darkMode={darkMode} />} />
            </Routes>
          </Container>
          
          {/* iOS PWA Install Prompt */}
          <IOSInstallPrompt />
          
          {/* Offline Status Notification */}
          <OfflineNotification />
        </Layout>
      </BudgetProvider>
    </ThemeProvider>
  );
};

export default App;