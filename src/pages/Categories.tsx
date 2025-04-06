import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tabs,
  Tab,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useBudget } from '../context/BudgetContext';
import { Category } from '../types';

// For color picker
type ColorResult = { hex: string };

// Helper to create a grid container with custom styling
const GridContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
    {children}
  </Box>
);

// Helper to create grid items with proper sizing
const GridItem: React.FC<{
  xs?: number;
  sm?: number;
  md?: number;
  children: React.ReactNode;
  key?: string;
}> = ({ children, xs = 12, sm, md, key }) => {
  const getColumnSpan = () => {
    if (window.innerWidth >= 900 && md) return md; // md breakpoint
    if (window.innerWidth >= 600 && sm) return sm; // sm breakpoint
    return xs; // xs breakpoint
  };
  
  return (
    <div key={key} style={{ gridColumn: `span ${getColumnSpan()}` }}>
      {children}
    </div>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Form initial state
const initialFormState = {
  name: '',
  color: '#1976d2',
  type: 'expense' as 'income' | 'expense',
};

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, getTransactionsByCategory } = useBudget();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Filter categories by type
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const incomeCategories = categories.filter((category) => category.type === 'income');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setFormData({
        name: category.name,
        color: category.color,
        type: category.type,
      });
      setSelectedCategoryId(category.id);
      setIsEditing(true);
    } else {
      setFormData({
        ...initialFormState,
        type: tabValue === 0 ? 'expense' : 'income',
      });
      setSelectedCategoryId(null);
      setIsEditing(false);
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setShowColorPicker(false);
  };

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

  const handleColorChange = (color: ColorResult) => {
    setFormData({
      ...formData,
      color: color.hex,
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      color: formData.color,
      type: formData.type,
    };

    if (isEditing && selectedCategoryId) {
      updateCategory(selectedCategoryId, categoryData);
    } else {
      addCategory(categoryData);
    }

    handleCloseDialog();
  };

  const handleDeleteClick = (id: string) => {
    const transactions = getTransactionsByCategory(id);
    setSelectedCategoryId(id);
    // Show warning if category has transactions
    if (transactions.length > 0) {
      setDeleteDialogOpen(true);
    } else {
      deleteCategory(id);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      deleteCategory(selectedCategoryId);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="category tabs">
            <Tab label="Expenses" id="category-tab-0" aria-controls="category-tabpanel-0" />
            <Tab label="Income" id="category-tab-1" aria-controls="category-tabpanel-1" />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mb: 1 }}
          >
            Add Category
          </Button>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <GridContainer>
            {expenseCategories.length > 0 ? (
              expenseCategories.map((category) => (
                <GridItem xs={12} sm={6} md={4} key={category.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: category.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="h6">{category.name}</Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(category.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </GridItem>
              ))
            ) : (
              <GridItem xs={12}>
                <Typography>No expense categories. Add your first one!</Typography>
              </GridItem>
            )}
          </GridContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <GridContainer>
            {incomeCategories.length > 0 ? (
              incomeCategories.map((category) => (
                <GridItem xs={12} sm={6} md={4} key={category.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: category.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="h6">{category.name}</Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(category.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </GridItem>
              ))
            ) : (
              <GridItem xs={12}>
                <Typography>No income categories. Add your first one!</Typography>
              </GridItem>
            )}
          </GridContainer>
        </TabPanel>
      </Box>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              name="type"
              value={formData.type}
              label="Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
            {errors.type && <FormHelperText error>{errors.type}</FormHelperText>}
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '4px',
                  bgcolor: formData.color,
                  cursor: 'pointer',
                  border: '1px solid #ddd',
                }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <Typography sx={{ ml: 2 }}>{formData.color}</Typography>
            </Box>
            {showColorPicker && (
              <Box sx={{ mt: 2, position: 'relative', zIndex: 2 }}>
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                  onClick={() => setShowColorPicker(false)}
                />
                <Box sx={{ position: 'relative' }}>
                  <ChromePicker color={formData.color} onChange={handleColorChange} />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This category has transactions associated with it. Deleting it will also remove all related transactions. Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Categories; 