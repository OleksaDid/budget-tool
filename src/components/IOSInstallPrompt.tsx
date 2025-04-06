import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Share as ShareIcon, AddCircle as AddCircleIcon } from '@mui/icons-material';

// Helper to detect iOS device
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Helper to detect if running as standalone PWA
const isInStandaloneMode = () => {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         ((window.navigator as any).standalone) || 
         document.referrer.includes('android-app://');
};

const IOSInstallPrompt: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    // Check if we should show install prompt (iOS device, not in standalone mode)
    const shouldShowPrompt = isIOS() && !isInStandaloneMode();
    
    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('iosInstallPromptDismissed') === 'true';
    
    // Show the prompt after a short delay if conditions are met
    if (shouldShowPrompt && !hasPromptBeenDismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this user
    localStorage.setItem('iosInstallPromptDismissed', 'true');
  };

  const handleShowLater = () => {
    setShowInstallPrompt(false);
    // We'll show it again next time they visit
  };

  const handleInstallClick = () => {
    setShowSnackbar(true);
    // Keep prompt visible so they can follow instructions
  };

  if (!showInstallPrompt) return null;

  return (
    <>
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 9999,
          p: 2,
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            maxWidth: '500px',
            mx: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2">
              Install Budget Tool App
            </Typography>
            <IconButton 
              size="small" 
              aria-label="close" 
              onClick={handleDismissPrompt}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Install this app on your iPhone for offline access and a better experience.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mr: 2 
              }}
            >
              <ShareIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">1. Tap</Typography>
            </Box>
            <Typography variant="body2">
              Tap the share button in Safari
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mr: 2 
              }}
            >
              <AddCircleIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">2. Add</Typography>
            </Box>
            <Typography variant="body2">
              Scroll down and tap "Add to Home Screen"
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="text" 
              onClick={handleShowLater}
            >
              Later
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleInstallClick}
            >
              Install Now
            </Button>
          </Box>
        </Paper>
      </Box>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={8000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          onClose={() => setShowSnackbar(false)}
        >
          Follow the steps above to install the app
        </Alert>
      </Snackbar>
    </>
  );
};

export default IOSInstallPrompt; 