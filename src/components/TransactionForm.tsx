import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Box,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import { Transaction, Category } from '../types';
import { useBudget } from '../context/BudgetContext';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  isEditing?: boolean;
}

const initialState = {
  date: new Date().toISOString().split('T')[0],
  amount: '',
  description: '',
  categoryId: '',
  type: 'expense' as 'income' | 'expense',
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  transaction,
  isEditing = false,
}) => {
  const { categories, addTransaction, updateTransaction } = useBudget();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (transaction && isEditing) {
      setFormData({
        date: transaction.date,
        amount: transaction.amount.toString(),
        description: transaction.description,
        categoryId: transaction.categoryId,
        type: transaction.type,
      });
    } else {
      setFormData(initialState);
    }
  }, [transaction, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({
      ...formData,
      type,
      // Clear category when type changes as it may not be valid for the new type
      categoryId: '',
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const transactionData = {
      date: formData.date,
      amount: Number(formData.amount),
      description: formData.description,
      categoryId: formData.categoryId,
      type: formData.type,
    };

    if (isEditing && transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onClose();
  };

  const filteredCategories = categories.filter((category) => category.type === formData.type);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant={formData.type === 'expense' ? 'contained' : 'outlined'}
            color="error"
            sx={{ mr: 1, minWidth: '120px' }}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </Button>
          <Button
            variant={formData.type === 'income' ? 'contained' : 'outlined'}
            color="success"
            sx={{ minWidth: '120px' }}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </Button>
        </Box>

        <TextField
          margin="dense"
          id="date"
          name="date"
          label="Date"
          type="date"
          fullWidth
          variant="outlined"
          value={formData.date}
          onChange={handleInputChange}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          margin="dense"
          id="amount"
          name="amount"
          label="Amount"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.amount}
          onChange={handleInputChange}
          error={!!errors.amount}
          helperText={errors.amount}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />

        <TextField
          margin="dense"
          id="description"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange}
          error={!!errors.description}
          helperText={errors.description}
        />

        <FormControl fullWidth margin="dense" error={!!errors.categoryId}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            label="Category"
            onChange={handleSelectChange}
          >
            {filteredCategories.map((category: Category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm; 