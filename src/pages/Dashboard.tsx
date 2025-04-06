import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { Add as AddIcon } from '@mui/icons-material';
import { useBudget } from '../context/BudgetContext';
import TransactionForm from '../components/TransactionForm';

// Helper to create wrapper divs for Grid items to fix TypeScript errors
const GridItem: React.FC<{
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return (
    <div style={{ gridColumn: `span ${props.xs || 12}` }}>
      {children}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    categories, 
    getTotalIncome, 
    getTotalExpense, 
    getBalance,
    getCategoryById
  } = useBudget();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Prepare data for expense pie chart
  const expensesByCategory = categories
    .filter(category => category.type === 'expense')
    .map(category => {
      const categoryTransactions = transactions.filter(
        t => t.categoryId === category.id && t.type === 'expense'
      );
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        id: category.id,
        value: total,
        label: category.name,
        color: category.color,
      };
    })
    .filter(item => item.value > 0);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTransactionDialogOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        {/* Summary Cards */}
        <GridItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Income
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                ${totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expenses
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                ${totalExpense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Balance
              </Typography>
              <Typography 
                variant="h5" 
                component="div" 
                color={balance >= 0 ? 'success.main' : 'error.main'}
              >
                ${balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </GridItem>

        {/* Expense Breakdown */}
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expense Breakdown
            </Typography>
            {expensesByCategory.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: expensesByCategory,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    },
                  ]}
                  height={300}
                />
              </Box>
            ) : (
              <Typography color="textSecondary" align="center">
                No expense data to display
              </Typography>
            )}
          </Paper>
        </GridItem>

        {/* Recent Transactions */}
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Transactions
            </Typography>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                return (
                  <Box key={transaction.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">{transaction.description}</Typography>
                      <Typography 
                        variant="body1" 
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">
                        {category?.name || 'Uncategorized'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {transaction !== recentTransactions[recentTransactions.length - 1] && (
                      <Divider sx={{ mt: 1.5, mb: 1.5 }} />
                    )}
                  </Box>
                );
              })
            ) : (
              <Typography color="textSecondary" align="center">
                No recent transactions
              </Typography>
            )}
          </Paper>
        </GridItem>
      </Box>

      {/* Transaction Dialog */}
      <TransactionForm
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
      />
    </>
  );
};

export default Dashboard; 