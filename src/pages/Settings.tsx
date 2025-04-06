import React, { useState } from 'react';
import {
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  DeleteForever as DeleteIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useBudget } from '../context/BudgetContext';
import { clearStorage } from '../services/storage';

interface SettingsProps {
  toggleDarkMode?: () => void;
  darkMode?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ toggleDarkMode, darkMode = false }) => {
  const { transactions, categories, budgets } = useBudget();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const handleResetData = () => {
    try {
      clearStorage();
      setSnackbarMessage('All data has been cleared. Please refresh the page.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setResetDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Failed to clear data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        transactions,
        categories,
        budgets,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `budget-tool-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSnackbarMessage('Data exported successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to export data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const fileReader = new FileReader();
      
      if (event.target.files && event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0], 'UTF-8');
        fileReader.onload = (e) => {
          if (e.target?.result) {
            const content = e.target.result as string;
            
            try {
              const parsedData = JSON.parse(content);
              
              // Validate the imported data structure
              if (!parsedData.transactions || !parsedData.categories) {
                throw new Error('Invalid import file format');
              }
              
              // Store the imported data in localStorage
              localStorage.setItem('transactions', JSON.stringify(parsedData.transactions));
              localStorage.setItem('categories', JSON.stringify(parsedData.categories));
              
              if (parsedData.budgets) {
                localStorage.setItem('budgets', JSON.stringify(parsedData.budgets));
              }
              
              setSnackbarMessage('Data imported successfully! Please refresh the page.');
              setSnackbarSeverity('success');
              setSnackbarOpen(true);
            } catch (err) {
              setSnackbarMessage('Failed to import data: Invalid file format.');
              setSnackbarSeverity('error');
              setSnackbarOpen(true);
            }
          }
        };
      }
    } catch (error) {
      setSnackbarMessage('Failed to import data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
      
      <Paper sx={{ mb: 3 }}>
        <List>
          {toggleDarkMode && (
            <>
              <ListItem>
                <ListItemIcon>
                  <DarkModeIcon />
                </ListItemIcon>
                <ListItemText primary="Dark Mode" secondary="Toggle between light and dark theme" />
                <Switch
                  edge="end"
                  onChange={toggleDarkMode}
                  checked={darkMode}
                  inputProps={{ 'aria-labelledby': 'dark-mode-switch' }}
                />
              </ListItem>
              <Divider />
            </>
          )}
          
          <ListItem>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText primary="Export Data" secondary="Download your data as a JSON file" />
            <Button variant="outlined" onClick={handleExportData}>
              Export
            </Button>
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <ImportIcon />
            </ListItemIcon>
            <ListItemText primary="Import Data" secondary="Import data from a JSON file" />
            <Button
              variant="outlined"
              component="label"
            >
              Import
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportData}
              />
            </Button>
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Reset All Data"
              secondary="Delete all your data. This action cannot be undone!"
              primaryTypographyProps={{ color: 'error' }}
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => setResetDialogOpen(true)}
            >
              Reset
            </Button>
          </ListItem>
        </List>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>About</Typography>
        <Typography variant="body1" paragraph>
          Budget Tool v1.0.0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A Progressive Web App for personal budget tracking that works offline.
          Built with React, Material UI, and LocalStorage.
        </Typography>
      </Paper>
      
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset All Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all your transactions, categories, and budget settings.
            This action cannot be undone. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetData} color="error" autoFocus>
            Reset All Data
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Settings; 