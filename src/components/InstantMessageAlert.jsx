import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Slide,
  Button,
  Chip
} from '@mui/material';
import {
  Close,
  Message,
  Person,
  AttachMoney,
  LocalShipping,
  CheckCircle
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const InstantMessageAlert = ({ 
  open, 
  onClose, 
  messageData,
  autoHideDuration = 8000 // 8 seconds auto hide
}) => {
  const [timeLeft, setTimeLeft] = useState(autoHideDuration / 1000);

  // Debug log to check messageData
  useEffect(() => {
    if (open && messageData) {
      console.log('🔍 InstantMessageAlert received data:', messageData);
      console.log('📝 Message:', messageData.message);
      console.log('👤 Sender:', messageData.sender);
      console.log('🏷️ Sender Type:', messageData.senderType);
      console.log('🚛 Load ID:', messageData.loadId);
      console.log('💰 Rate:', messageData.rate);
    }
  }, [open, messageData]);

  useEffect(() => {
    if (!open) return;

    // Auto close timer
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, autoHideDuration);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Reset countdown when opened
    setTimeLeft(autoHideDuration / 1000);

    return () => {
      clearTimeout(autoCloseTimer);
      clearInterval(countdownInterval);
    };
  }, [open, autoHideDuration, onClose]);

  const handleClose = () => {
    onClose();
  };

  if (!messageData) {
    console.log('❌ InstantMessageAlert: No messageData provided');
    return null;
  }

  // Ensure we have valid data with fallbacks - Default sender is "Shyam Singh"
  const safeMessageData = {
    message: messageData.message || 'New message received',
    sender: messageData.sender || 'Shyam Singh',
    senderType: messageData.senderType || 'Broker',
    loadId: messageData.loadId || null,
    rate: messageData.rate || null,
    timestamp: messageData.timestamp || new Date(),
    _id: messageData._id || Date.now().toString()
  };

  console.log('✅ InstantMessageAlert: Using safe data:', safeMessageData);

  const getMessageIcon = () => {
    const type = safeMessageData.senderType?.toLowerCase();
    if (type === 'system') return <CheckCircle sx={{ color: '#4caf50' }} />;
    if (safeMessageData.message?.toLowerCase().includes('bid')) return <AttachMoney sx={{ color: '#ff9800' }} />;
    if (safeMessageData.loadId) return <LocalShipping sx={{ color: '#2196f3' }} />;
    return <Message sx={{ color: '#9c27b0' }} />;
  };

  const getAlertColor = () => {
    const type = safeMessageData.senderType?.toLowerCase();
    if (type === 'system') return 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
    if (safeMessageData.message?.toLowerCase().includes('bid')) return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    if (safeMessageData.message?.toLowerCase().includes('delivery')) return 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)';
    return 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      slotProps={{
        paper: {
          sx: {
            position: 'fixed',
            top: 100,
            right: 20,
            m: 0,
            maxWidth: 420,
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: getAlertColor(),
            color: 'white',
            overflow: 'hidden',
            animation: open ? 'slideInBounce 0.6s ease-out' : 'none',
            '@keyframes slideInBounce': {
              '0%': {
                transform: 'translateX(100%) scale(0.8)',
                opacity: 0,
              },
              '60%': {
                transform: 'translateX(-10px) scale(1.05)',
                opacity: 0.9,
              },
              '100%': {
                transform: 'translateX(0) scale(1)',
                opacity: 1,
              }
            }
          }
        },
        backdrop: {
          invisible: true
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header with pulse animation */}
        <Box sx={{ 
          p: 2.5,
          position: 'relative'
        }}>
          {/* Close button */}
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white', 
              opacity: 0.8,
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          {/* Header content */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 2
          }}>
            <Box sx={{ 
              position: 'relative',
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getMessageIcon()}
              {/* Pulse animation */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                    opacity: 0.3,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  }
                }
              }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: 'white',
                fontSize: '1.1rem',
                mb: 0.5
              }}>
                🔔 New Message
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.85rem'
              }}>
                Auto-close in {timeLeft}s
              </Typography>
            </Box>
          </Box>

          {/* Sender Info - SHYAM SINGH PROMINENTLY DISPLAYED */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            p: 1.5
          }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              width: 45,
              height: 45,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              S
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600,
                color: 'white',
                fontSize: '1.1rem'
              }}>
                {safeMessageData.sender}
              </Typography>
              <Chip 
                label={safeMessageData.senderType} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </Box>

          {/* Load Info (if available) */}
          {safeMessageData.loadId && (
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 2, 
              p: 1.5, 
              mb: 2,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping sx={{ fontSize: 18, color: 'white' }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: 'white'
                }}>
                  Load ID: {safeMessageData.loadId}
                </Typography>
              </Box>
              {safeMessageData.rate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 16, color: 'white' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Rate: ₹{safeMessageData.rate}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Message Content */}
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.15)', 
            borderRadius: 2, 
            p: 2, 
            mb: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body1" sx={{ 
              color: 'white',
              lineHeight: 1.6,
              fontSize: '0.95rem',
              fontWeight: 500
            }}>
              {safeMessageData.message}
            </Typography>
            
            {/* Timestamp */}
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
              mt: 1,
              display: 'block'
            }}>
              {new Date(safeMessageData.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            justifyContent: 'space-between'
          }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Dismiss
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Trigger main notification panel
                const notificationButton = document.querySelector('[aria-label="Notifications"]');
                if (notificationButton) {
                  notificationButton.click();
                }
                handleClose();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              View All Messages
            </Button>
          </Box>

          {/* Progress bar */}
          <Box sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              width: `${(timeLeft / (autoHideDuration / 1000)) * 100}%`,
              transition: 'width 1s linear'
            }} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InstantMessageAlert;