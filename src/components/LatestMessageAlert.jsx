import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import UniversalMessageListener from './UniversalMessageListener';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Slide,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge
} from '@mui/material';
import {
  Close,
  Message,
  Person,
  Refresh
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const LatestMessageAlert = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to check if message is from last 30 minutes (very recent)
  const isVeryRecent = (timestamp) => {
    const messageDate = new Date(timestamp);
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    return messageDate >= thirtyMinutesAgo;
  };

  // Filter messages to show only very recent messages (last 30 minutes)
  const getRecentMessages = (messageList) => {
    return messageList.filter(msg => isVeryRecent(msg.timestamp));
  };

  // Handler for universal message listener
  const handleUniversalMessage = (messageData) => {
    console.log('🎯 Universal message handler received:', messageData);
    console.log('👤 Broker/Sender name:', messageData.sender);
    
    // Store the real message in localStorage for persistence
    messageService.storeMessage(messageData);
    
    // Check if message is very recent (last 30 minutes)
    if (!isVeryRecent(messageData.timestamp)) {
      console.log('⏰ Message is not from last 30 minutes, skipping display');
      return; // Skip messages that are not very recent
    }
    
    // Add new message to the list (only very recent messages)
    setMessages(prev => {
      const updatedMessages = [messageData, ...prev];
      const recentMessages = getRecentMessages(updatedMessages).slice(0, 5); // Keep only latest 5 recent messages
      return recentMessages;
    });
    
    // Show notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2+LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1+LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore audio errors
    }
  };

  // Fetch latest messages function
  const fetchLatestMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await messageService.getLatestMessages();
      
      if (response.success && response.messages) {
        // Filter to show only very recent messages (last 30 minutes)
        const recentMessages = getRecentMessages(response.messages);
        setMessages(recentMessages);
      }
    } catch (err) {
      console.error('Error fetching latest messages:', err);
      
      // First try to get stored real-time messages
      const storedMessages = messageService.getStoredMessages();
      if (storedMessages.length > 0) {
        console.log('📦 Using stored real-time messages instead of dummy data');
        const recentMessages = getRecentMessages(storedMessages);
        setMessages(recentMessages);
      } else {
        // Only show empty state if no stored messages
        console.log('⚠️ No stored messages available, showing empty state');
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log('🔔 New message received:', data);
      
      // Store the real message in localStorage for persistence
      messageService.storeMessage(data);
      
      // Add new message to the list
      setMessages(prev => [data, ...prev.slice(0, 9)]); // Keep only latest 10
      
      // Show notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
    };

    // Listen for various message events - comprehensive list based on existing system
    const messageEvents = [
      // Chat/Message events
      'new_message',
      'receive_message', 
      'chat_message',
      'message',
      'new_chat_message',
      
      // Negotiation events
      'negotiation_message',
      'new_negotiation_message',
      'bid_negotiation_update',
      
      // Bid events
      'bid_update',
      'new_bid',
      
      // Load events
      'load_update',
      
      // System events
      'system_notification'
    ];

    messageEvents.forEach(event => {
      socket.on(event, handleNewMessage);
    });

    return () => {
      messageEvents.forEach(event => {
        socket.off(event, handleNewMessage);
      });
    };
  }, [socket]);

  // Auto-fetch messages on component mount
  useEffect(() => {
    fetchLatestMessages();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLatestMessages, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleMessageClick = async (message) => {
    if (!message.read) {
      try {
        await messageService.markMessageAsRead(message._id);
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg._id === message._id ? { ...msg, read: true } : msg
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Universal Message Listener */}
      <UniversalMessageListener onNewMessage={handleUniversalMessage} />
      
      {/* Messages Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        slotProps={{
          paper: {
            sx: {
              position: 'fixed',
              top: 80,
              right: 20,
              m: 0,
              maxWidth: 450,
              width: '100%',
              maxHeight: '70vh',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          },
          backdrop: {
            invisible: true
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Message color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Messages
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={fetchLatestMessages} 
                  size="small"
                  disabled={loading}
                >
                  <Refresh />
                </IconButton>
                <IconButton onClick={handleClose} size="small">
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Messages List */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading messages...</Typography>
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No messages today
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                  Messages from previous days are not shown
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {messages.map((msg, index) => (
                  <React.Fragment key={msg._id || index}>
                    <ListItem 
                      sx={{ 
                        py: 2,
                        cursor: 'pointer',
                        backgroundColor: msg.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                      onClick={() => handleMessageClick(msg)}
                    >
                      <ListItemAvatar>
                        <Badge 
                          variant="dot" 
                          color="error" 
                          invisible={msg.read}
                          sx={{
                            '& .MuiBadge-badge': {
                              top: 8,
                              right: 8
                            }
                          }}
                        >
                          <Avatar sx={{ 
                            bgcolor: msg.senderType === 'System' ? '#ff9800' : '#2196f3',
                            width: 40,
                            height: 40
                          }}>
                            <Person />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {msg.sender || 'Shyam Singh'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(msg.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                              {msg.message?.length > 80 
                                ? msg.message.substring(0, 80) + '...' 
                                : msg.message || 'New message'}
                            </Typography>
                            {msg.loadId && (
                              <Typography variant="caption" sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem'
                              }}>
                                Load: {msg.loadId}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < messages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5'
          }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchLatestMessages}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Today\'s Messages'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default LatestMessageAlert;