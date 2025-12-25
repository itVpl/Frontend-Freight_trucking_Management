import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField } from '@mui/material';
import { useNegotiation } from '../context/NegotiationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';
import alertify from 'alertifyjs';

import { useSocket } from '../context/SocketContext';

const UniversalNegotiationPopup = () => {
  const { isOpen, closeNegotiation, negotiationData } = useNegotiation();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Poll history when open
  useEffect(() => {
    if (!isOpen || !negotiationData) return;
    
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const bidId = negotiationData.bidId || negotiationData._id;
            const response = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.data?.internalNegotiation) {
                setHistory(response.data.data.internalNegotiation.history || []);
            }
        } catch (error) {
            console.error('Error fetching negotiation history:', error);
        }
    };
    
    fetchHistory();
    // Socket setup for real-time updates
    if (socket && negotiationData) {
        const bidId = negotiationData.bidId || negotiationData._id;
        socket.emit('join_bid_negotiation', bidId);
        
        const handleNegotiationUpdate = (data) => {
            if (data.bidId === bidId && data.internalNegotiation) {
                setHistory(data.internalNegotiation.history || []);
            }
        };

        socket.on('bid_negotiation_update', handleNegotiationUpdate);
        
        return () => {
            socket.emit('leave_bid_negotiation', bidId);
            socket.off('bid_negotiation_update', handleNegotiationUpdate);
        };
    }
  }, [isOpen, negotiationData, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [history]);

  const handleSend = async () => {
      if (!message.trim()) return;
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const bidId = negotiationData.bidId || negotiationData._id;
          
          let endpoint = '';
          let body = {};
          
          if (user?.type === 'trucker') {
              endpoint = `${BASE_API_URL}/api/v1/bid/${bidId}/trucker-internal-negotiate`;
              body = { message };
          } else {
              // Shipper logic
              endpoint = `${BASE_API_URL}/api/v1/bid/${bidId}/shipper-internal-negotiate`;
              body = { 
                  message, 
                  shipperCounterRate: negotiationData.shipperCounterRate || 0 
              };
          }

          const response = await axios.put(endpoint, body, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });

          if (response.data.success) {
              setMessage('');
              // Immediate refresh
              const histRes = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              if (histRes.data.success && histRes.data.data?.internalNegotiation) {
                  setHistory(histRes.data.data.internalNegotiation.history);
              }
              alertify.success('Message sent');
          }
      } catch (error) {
          console.error('Error sending message:', error);
          alertify.error(error.response?.data?.message || 'Failed to send message');
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={closeNegotiation} maxWidth="sm" fullWidth>
      <DialogTitle>
        Negotiation Details
        {(negotiationData?.loadId || negotiationData?.load?.loadId || negotiationData?.shipmentNumber) && (
            <Typography variant="subtitle2" color="textSecondary">
                Load ID: {negotiationData?.loadId || negotiationData?.load?.loadId || negotiationData?.shipmentNumber}
            </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box 
            ref={scrollRef} 
            sx={{ 
                height: 300, 
                overflowY: 'auto', 
                mb: 2, 
                p: 2, 
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                bgcolor: '#fafafa'
            }}
        >
            {history.length > 0 ? (
                history.map((msg, i) => {
                    const isShipper = (msg.by || '').toLowerCase().includes('shipper');
                    // If user is trucker, shipper messages are 'received' (left), trucker messages are 'sent' (right)
                    // If user is shipper, shipper messages are 'sent' (right), trucker messages are 'received' (left)
                    const isMe = user?.type === 'trucker' ? !isShipper : isShipper;
                    
                    return (
                        <Box key={i} sx={{ 
                            display: 'flex', 
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            mb: 1.5 
                        }}>
                            <Box sx={{ maxWidth: '75%' }}>
                                <Box sx={{ 
                                    bgcolor: isMe ? '#1976d2' : '#fff',
                                    color: isMe ? '#fff' : 'text.primary',
                                    p: 1.5, 
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    borderTopRightRadius: isMe ? 0 : 2,
                                    borderTopLeftRadius: isMe ? 2 : 0
                                }}>
                                    <Typography variant="body2">{msg.message}</Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                                    {msg.by} • {new Date(msg.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })
            ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 10 }}>
                    No messages yet.
                </Typography>
            )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
                fullWidth 
                size="small"
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Type a message..."
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
            />
            <Button 
                onClick={handleSend} 
                variant="contained" 
                disabled={loading || !message.trim()}
                endIcon={<span>➤</span>}
            >
                Send
            </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeNegotiation} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UniversalNegotiationPopup;
