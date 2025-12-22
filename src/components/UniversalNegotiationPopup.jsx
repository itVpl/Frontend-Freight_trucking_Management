import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNegotiation } from '../context/NegotiationContext';

const UniversalNegotiationPopup = () => {
  const { isOpen, closeNegotiation, negotiationData } = useNegotiation();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={closeNegotiation} maxWidth="sm" fullWidth>
      <DialogTitle>Negotiation</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Negotiation details for {negotiationData?.id || 'unknown load'}
        </Typography>
        {/* Add more negotiation details and form fields here */}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeNegotiation} color="secondary">
          Cancel
        </Button>
        <Button onClick={closeNegotiation} color="primary" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UniversalNegotiationPopup;
