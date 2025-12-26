import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import messageService from '../services/messageService';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert
} from '@mui/material';

const RealDataDebugger = () => {
  const { socket } = useSocket();
  const [realTimeMessages, setRealTimeMessages] = useState([]);
  const [storedMessages, setStoredMessages] = useState([]);
  const [socketEvents, setSocketEvents] = useState([]);

  // Load stored messages on mount
  useEffect(() => {
    loadStoredMessages();
  }, []);

  // Listen to ALL socket events for debugging
  useEffect(() => {
    if (!socket) return;

    const handleAnyEvent = (eventName, data) => {
      const eventLog = {
        id: Date.now(),
        eventName,
        data,
        timestamp: new Date().toISOString(),
        dataType: typeof data
      };
      
      console.log('🔍 Socket Event Captured:', eventLog);
      setSocketEvents(prev => [eventLog, ...prev.slice(0, 19)]); // Keep last 20 events
      
      // If it looks like a message, add to real-time messages
      if (data && (data.message || typeof data === 'string')) {
        const messageData = {
          id: Date.now(),
          eventName,
          rawData: data,
          processedMessage: typeof data === 'string' ? data : data.message,
          sender: typeof data === 'object' ? (data.sender || data.senderName || 'Unknown') : data,
          timestamp: new Date().toISOString()
        };
        
        setRealTimeMessages(prev => [messageData, ...prev.slice(0, 9)]);
      }
    };

    socket.onAny(handleAnyEvent);

    return () => {
      socket.offAny(handleAnyEvent);
    };
  }, [socket]);

  const loadStoredMessages = () => {
    const stored = messageService.getStoredMessages();
    setStoredMessages(stored);
  };

  const clearStoredMessages = () => {
    messageService.clearStoredMessages();
    setStoredMessages([]);
  };

  const clearRealTimeMessages = () => {
    setRealTimeMessages([]);
  };

  const clearSocketEvents = () => {
    setSocketEvents([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        🔍 Real Data Debugger
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This debugger shows real socket events and messages. When you hit "Negotiate" and receive messages, 
        they should appear here with the actual data instead of dummy content.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
        
        {/* Real-Time Socket Events */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">🔴 Live Socket Events</Typography>
              <Button size="small" onClick={clearSocketEvents}>Clear</Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              All socket events in real-time:
            </Typography>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {socketEvents.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No events yet..." />
                </ListItem>
              ) : (
                socketEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={event.eventName} 
                              size="small" 
                              color="primary"
                            />
                            <Typography variant="caption">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              Type: {event.dataType}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              Data: {JSON.stringify(event.data).substring(0, 100)}
                              {JSON.stringify(event.data).length > 100 && '...'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        {/* Real-Time Messages */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">📨 Real-Time Messages</Typography>
              <Button size="small" onClick={clearRealTimeMessages}>Clear</Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Processed message events:
            </Typography>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {realTimeMessages.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No messages yet..." />
                </ListItem>
              ) : (
                realTimeMessages.map((msg) => (
                  <React.Fragment key={msg.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {msg.sender}
                            </Typography>
                            <Chip 
                              label={msg.eventName} 
                              size="small" 
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Message: "{msg.processedMessage}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(msg.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 1 }}>
                              Raw: {JSON.stringify(msg.rawData).substring(0, 80)}...
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        {/* Stored Messages */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">💾 Stored Messages</Typography>
              <Box>
                <Button size="small" onClick={loadStoredMessages} sx={{ mr: 1 }}>Refresh</Button>
                <Button size="small" onClick={clearStoredMessages} color="error">Clear</Button>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Messages saved to localStorage:
            </Typography>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {storedMessages.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No stored messages..." />
                </ListItem>
              ) : (
                storedMessages.map((msg, index) => (
                  <React.Fragment key={msg._id || index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {msg.sender}
                            </Typography>
                            <Chip 
                              label={msg.senderType} 
                              size="small" 
                              color="secondary"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              "{msg.message}"
                            </Typography>
                            {msg.loadId && (
                              <Typography variant="caption" sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                mt: 0.5,
                                display: 'inline-block'
                              }}>
                                Load: {msg.loadId}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(msg.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Connection Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔌 Connection Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              label={socket?.connected ? 'Connected' : 'Disconnected'} 
              color={socket?.connected ? 'success' : 'error'}
            />
            <Typography variant="body2">
              Socket ID: {socket?.id || 'Not connected'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RealDataDebugger;