import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import { useTink } from '../context/TinkContext';
import { TinkTransaction } from '../services/tinkService';
import { useBudget } from '../context/BudgetContext';
import tinkService from '../services/tinkService';

const TinkTransactionsTable: React.FC = () => {
  const { 
    tinkTransactions, 
    isLoading, 
    error, 
    isAuthenticated, 
    connectToTink,
    refreshTransactions,
    accessToken 
  } = useTink();
  const { 
    addTransaction, 
    categories, 
    getCategoryById 
  } = useBudget();
  
  // Local state for refresh indicator
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Selected transactions state
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);

  // Handle manual refresh with loading indicator
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000); // Ensure spinner shows at least briefly
    }
  };

  // Log auth state on mount and changes
  useEffect(() => {
    console.log('TinkTransactionsTable - Auth state:', {
      isAuthenticated,
      hasAccessToken: !!accessToken,
      transactionsCount: tinkTransactions?.length || 0,
    });
  }, [isAuthenticated, accessToken, tinkTransactions]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((transId) => transId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = slicedTransactions.map((t) => t.id);
      setSelectedTransactions(allIds);
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleOpenImportDialog = () => {
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction to import');
      return;
    }
    setImportDialogOpen(true);
    
    // Determine the default category type based on selected transactions
    const selectedTxs = tinkTransactions.filter(t => selectedTransactions.includes(t.id));
    const allIncome = selectedTxs.every(t => t.amount >= 0);
    const allExpense = selectedTxs.every(t => t.amount < 0);
    
    // Pre-select a category if all transactions are of the same type
    if (allIncome) {
      const incomeCategories = categories.filter(c => c.type === 'income');
      if (incomeCategories.length > 0) {
        setSelectedCategoryId(incomeCategories[0].id);
      }
    } else if (allExpense) {
      const expenseCategories = categories.filter(c => c.type === 'expense');
      if (expenseCategories.length > 0) {
        setSelectedCategoryId(expenseCategories[0].id);
      }
    }
  };

  const handleImport = () => {
    if (!selectedCategoryId) {
      alert('Please select a category');
      return;
    }

    try {
      // Filter the transactions to only get the selected ones
      const transactionsToImport = tinkTransactions.filter(t => 
        selectedTransactions.includes(t.id)
      );
      
      // Map transactions to app format and add them
      const mappedTransactions = tinkService.mapTinkTransactionsToAppFormat(transactionsToImport);
      
      // Override category with the selected one
      mappedTransactions.forEach(t => {
        t.categoryId = selectedCategoryId;
        addTransaction(t);
      });
      
      // Reset state
      setSelectedTransactions([]);
      setImportDialogOpen(false);
      setSelectedCategoryId('');
      setImportSuccess(true);
      
      // Show success for 3 seconds
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (err) {
      console.error('Error importing transactions:', err);
      setImportSuccess(false);
      setTimeout(() => setImportSuccess(null), 3000);
    }
  };

  // Calculate transaction type distribution for the selected transactions
  const getTransactionTypes = () => {
    const selectedTxs = tinkTransactions.filter(t => selectedTransactions.includes(t.id));
    const incomeCount = selectedTxs.filter(t => t.amount >= 0).length;
    const expenseCount = selectedTxs.filter(t => t.amount < 0).length;
    
    let messageText = '';
    if (incomeCount > 0 && expenseCount > 0) {
      messageText = `You've selected ${incomeCount} income and ${expenseCount} expense transactions.`;
    } else if (incomeCount > 0) {
      messageText = `All selected transactions are income.`;
    } else {
      messageText = `All selected transactions are expenses.`;
    }
    
    return messageText;
  };

  // Filter categories by transaction type
  const getCategoriesForImport = () => {
    const selectedTxs = tinkTransactions.filter(t => selectedTransactions.includes(t.id));
    const hasIncome = selectedTxs.some(t => t.amount >= 0);
    const hasExpense = selectedTxs.some(t => t.amount < 0);
    
    if (hasIncome && !hasExpense) {
      return categories.filter(c => c.type === 'income');
    } else if (hasExpense && !hasIncome) {
      return categories.filter(c => c.type === 'expense');
    } else {
      // Mixed transaction types, show all categories
      return categories;
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Connect to Bank via Tink
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          You need to connect your bank account to view your transactions.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            console.log('Connecting to Tink...');
            connectToTink();
          }}
          sx={{ mt: 2 }}
        >
          Connect Bank Account
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading transactions...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error fetching transactions: {error.message}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleRefresh} 
          sx={{ ml: 2 }}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  // No transactions found but authenticated
  if (tinkTransactions.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Bank Transactions
          </Typography>
          <Button 
            startIcon={<SyncIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'} 
          </Button>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          No transactions found. Your bank account might not have any transactions, or there might be an issue with the connection.
        </Alert>
      </Box>
    );
  }

  // Calculate pagination
  const slicedTransactions = tinkTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {importSuccess === true && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Transactions imported successfully!
        </Alert>
      )}
      
      {importSuccess === false && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to import transactions. Please try again.
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Bank Transactions ({tinkTransactions.length})
        </Typography>
        <Box>
          <Button 
            startIcon={<SyncIcon />} 
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{ mr: 1 }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="contained" 
            disabled={selectedTransactions.length === 0}
            onClick={handleOpenImportDialog}
          >
            Import Selected ({selectedTransactions.length})
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="ActivoBank transactions table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < slicedTransactions.length}
                  checked={slicedTransactions.length > 0 && selectedTransactions.length === slicedTransactions.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slicedTransactions.length > 0 ? (
              slicedTransactions.map((transaction: TinkTransaction) => {
                // Determine if transaction is income or expense based on amount
                const isIncome = transaction.amount >= 0;
                const isSelected = selectedTransactions.includes(transaction.id);
                
                return (
                  <TableRow 
                    key={transaction.id}
                    hover
                    onClick={() => handleSelectTransaction(transaction.id)}
                    selected={isSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={transaction.originalDescription || transaction.description}>
                        <span>{transaction.description}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      color: isIncome ? 'success.main' : 'error.main',
                      fontWeight: 'medium',
                    }}>
                      {isIncome ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.categoryId ? (
                        <Chip 
                          label={getCategoryById(transaction.categoryId)?.name || transaction.categoryId} 
                          size="small"
                          sx={{
                            backgroundColor: getCategoryById(transaction.categoryId)?.color || '#888',
                            color: '#fff',
                          }}
                        />
                      ) : 'Uncategorized'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isIncome ? 'Income' : 'Expense'}
                        color={isIncome ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={tinkTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import {selectedTransactions.length} Transactions</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Selected transactions will be imported into your budget app.
              Please select a category for these transactions:
            </Typography>
            
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              {getTransactionTypes()}
            </Alert>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={selectedCategoryId}
                label="Category"
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {getCategoriesForImport().map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 1,
                        }}
                      />
                      {category.name} ({category.type})
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={!selectedCategoryId}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TinkTransactionsTable; 