import React, { useState, useEffect } from 'react';
import { Box, Alert, AlertTitle, Collapse } from '@mui/material';

const OfflineNotification: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Handler for when the device goes offline
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineMessage(true);

      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
    };

    // Handler for when the device comes back online
    const handleOnline = () => {
      setIsOffline(false);
      // Show the back online message only if we were previously offline
      if (isOffline) {
        setShowOfflineMessage(true);
        
        // Hide the message after 5 seconds
        setTimeout(() => {
          setShowOfflineMessage(false);
        }, 5000);
      }
    };

    // Register the event listeners
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Show the message initially if we're offline
    if (isOffline) {
      setShowOfflineMessage(true);
      
      setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
    }

    // Clean up the event listeners when component unmounts
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [isOffline]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <Collapse in={showOfflineMessage}>
        <Alert 
          severity={isOffline ? "warning" : "success"} 
          variant="filled"
          onClose={() => setShowOfflineMessage(false)}
        >
          <AlertTitle>{isOffline ? 'You are offline' : 'You are back online'}</AlertTitle>
          {isOffline 
            ? 'Your changes will be saved locally and synced when you reconnect.' 
            : 'All your data is now synced.'}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default OfflineNotification; 