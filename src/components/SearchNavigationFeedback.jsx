import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const SearchNavigationFeedback = ({ searchResult, searchQuery }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searchResult && searchQuery) {
      const resultType = searchResult.type;
      const resultTitle = searchResult.title;
      
      let feedbackMessage = '';
      
      switch (resultType) {
        case 'shipments':
          feedbackMessage = `Found shipment: ${resultTitle}`;
          break;
        case 'bills':
          feedbackMessage = `Found bill: ${resultTitle}`;
          break;
        case 'users':
          feedbackMessage = `Found user: ${resultTitle}`;
          break;
        case 'drivers':
          feedbackMessage = `Found driver: ${resultTitle}`;
          break;
        case 'fleet':
          feedbackMessage = `Found vehicle: ${resultTitle}`;
          break;
        case 'reports':
          feedbackMessage = `Found report: ${resultTitle}`;
          break;
        default:
          feedbackMessage = `Found: ${resultTitle}`;
          break;
      }
      
      setMessage(feedbackMessage);
      setOpen(true);
    }
  }, [searchResult, searchQuery]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        icon={<CheckCircle />}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SearchNavigationFeedback;