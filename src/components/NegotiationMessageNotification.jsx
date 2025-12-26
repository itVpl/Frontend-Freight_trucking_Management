import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Slide,
  Chip,
  Button
} from '@mui/material';
import {
  Close,
  Message,
  Person,
  AttachMoney,
  LocalShipping
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const NegotiationMessageNotification = ({ 
  open, 
  onClose, 
  messageData, 
  onViewNegotiation 
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    if (open) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      setAutoCloseTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [open, onClose]);

  const handleClose = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    onClose();
  };

  const handleViewNegotiation = () => {
    handleClose();
    if (onViewNegotiation) {
      onViewNegotiation();
    }
  };

  if (!messageData) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 20,
          right: 20,
          m: 0,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
      BackdropProps={{
        invisible: true
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Message sx={{ color: '#FFD700' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                New Negotiation Message
              </Typography>
            </Box>
            <IconButton 
              onClick={handleClose} 
              size="small"
              sx={{ color: 'white', opacity: 0.8 }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Load Info */}
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 2, 
            p: 2, 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalShipping sx={{ fontSize: 16, color: '#FFD700' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Load: {messageData.loadId?.slice(-8) || 'N/A'}
              </Typography>
            </Box>
            {messageData.rate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ fontSize: 16, color: '#90EE90' }} />
                <Typography variant="body2">
                  Rate: ${messageData.rate}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Sender Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              width: 40,
              height: 40
            }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {messageData.sender || 'Driver'}
              </Typography>
              <Chip 
                label={messageData.senderType || 'Driver'} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          {/* Message */}
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 2, 
            p: 2, 
            mb: 3 
          }}>
            <Typography variant="body2" sx={{ 
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxHeight: 60,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              "{messageData.message?.length > 100 
                ? messageData.message.substring(0, 100) + '...' 
                : messageData.message || 'New message received'}"
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleViewNegotiation}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            View Negotiation
          </Button>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ 
          height: 3, 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            height: '100%',
            backgroundColor: '#FFD700',
            animation: 'progress 5s linear',
            '@keyframes progress': {
              '0%': { width: '100%' },
              '100%': { width: '0%' }
            }
          }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationMessageNotification;