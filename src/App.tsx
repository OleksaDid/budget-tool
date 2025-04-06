import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from './components/Layout';
import { BudgetProvider } from './context/BudgetContext';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <BudgetProvider>
      <Layout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Container>
      </Layout>
    </BudgetProvider>
  );
};

export default App;