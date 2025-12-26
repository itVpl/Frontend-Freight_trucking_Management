import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { useSocket } from '../context/SocketContext';

const MessageNotificationTester = () => {
  const { socket } = useSocket();

  const testNegotiationMessage = () => {
    if (socket) {
      // Simulate a negotiation message from backend
      const testData = {
        sender: 'John Driver',
        senderName: 'John Driver',
        senderType: 'Driver',
        message: 'Hi, I can do this load for $1200. Please let me know if this works for you.',
        loadId: '6749da1092b6720e79d6d06',
        bidId: 'bid_' + Date.now(),
        rate: '$1200',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Testing negotiation message:', testData);
      socket.emit('new_negotiation_message', testData);
    } else {
      console.error('Socket not connected');
      alert('Socket not connected. Please check your connection.');
    }
  };

  const testNegotiationMessage2 = () => {
    if (socket) {
      const testData = {
        sender: 'Mike Trucker',
        senderName: 'Mike Trucker', 
        senderType: 'Driver',
        message: 'Can we negotiate the rate? I was thinking $1350 would be fair for this route.',
        loadId: '6749da1092b6720e79d6d07',
        bidId: 'bid_' + Date.now(),
        rate: '$1350',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Testing negotiation message 2:', testData);
      socket.emit('new_negotiation_message', testData);
    }
  };

  const testLongMessage = () => {
    if (socket) {
      const testData = {
        sender: 'Sarah Driver',
        senderName: 'Sarah Driver',
        senderType: 'Driver', 
        message: 'Hello! I am very interested in this load. I have been driving for 15 years and have excellent safety record. I can pick up the load on time and deliver it safely. However, I would like to discuss the rate as fuel costs have increased significantly. Would $1400 work for you? I am flexible with timing and can adjust my schedule as needed. Please let me know your thoughts. Thank you!',
        loadId: '6749da1092b6720e79d6d08',
        bidId: 'bid_' + Date.now(),
        rate: '$1400',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Testing long message:', testData);
      socket.emit('new_negotiation_message', testData);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Message Notification Tester
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Test the new message notification popup system
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={testNegotiationMessage}
          sx={{ textTransform: 'none' }}
        >
          Test Message 1 (John Driver)
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={testNegotiationMessage2}
          sx={{ textTransform: 'none' }}
        >
          Test Message 2 (Mike Trucker)
        </Button>
        
        <Button 
          variant="contained" 
          color="warning"
          onClick={testLongMessage}
          sx={{ textTransform: 'none' }}
        >
          Test Long Message (Sarah Driver)
        </Button>
      </Box>
      
      <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
        Socket Status: {socket ? '🟢 Connected' : '🔴 Disconnected'}
      </Typography>
    </Paper>
  );
};

export default MessageNotificationTeste