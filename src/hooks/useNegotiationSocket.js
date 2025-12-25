import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_API_URL } from '../apiConfig';

export const useNegotiationSocket = (user, bidId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(BASE_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on('connect', () => {
      console.log('✅ Negotiation Socket connected');
      setIsConnected(true);

      // Identify user based on type
      if (user.userType === 'shipper' || user.type === 'shipper') {
        // For shippers: use userId or _id
        socket.emit('join_shipper', user._id || user.userId);
      } else if (user.empId) {
        // For employees: use empId
        socket.emit('join', user.empId);
      } else {
        // Fallback: use _id or userId
        socket.emit('join', user._id || user.userId);
      }

      // Join the negotiation room for this specific bid if bidId is provided
      if (bidId) {
        socket.emit('join_bid_negotiation', bidId);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Negotiation Socket disconnected');
      setIsConnected(false);
    });

    // 🔥 MAIN EVENT: Listen for new negotiation messages
    socket.on('new_negotiation_message', (data) => {
      console.log('📨 New negotiation message:', data);
      
      // Store the real message for persistence (import messageService at top)
      try {
        // Create a proper message object for storage
        const messageForStorage = {
          _id: data._id || Date.now().toString(),
          message: data.message || `New rate: ${data.rate?.toLocaleString()}`,
          sender: data.senderName || (data.sender === 'shipper' ? 'Shipper' : 'Sales Team'),
          senderType: data.sender === 'shipper' ? 'Shipper' : 'Driver',
          timestamp: data.timestamp || new Date().toISOString(),
          loadId: data.bidId,
          rate: data.rate,
          read: false
        };
        
        // Store in localStorage directly since we can't import messageService in hook
        const stored = JSON.parse(localStorage.getItem('realTimeMessages') || '[]');
        const updated = [messageForStorage, ...stored.slice(0, 19)];
        localStorage.setItem('realTimeMessages', JSON.stringify(updated));
        console.log('💾 Stored negotiation message:', messageForStorage);
      } catch (error) {
        console.error('Error storing negotiation message:', error);
      }
      
      // Only process if it's for the current bid (if bidId is specified)
      if (!bidId || data.bidId === bidId) {
        setNewMessage(data);
        
        // Create notification object
        const notification = {
          id: Date.now(),
          bidId: data.bidId,
          sender: data.senderName || (data.sender === 'shipper' ? 'Shipper' : 'Sales Team'),
          message: data.message || `New rate: $${data.rate?.toLocaleString()}`,
          rate: data.rate,
          timestamp: data.timestamp || new Date().toISOString(),
          isShipper: data.sender === 'shipper',
          type: data.type || 'negotiation'
        };

        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Negotiation Message', {
            body: `${notification.sender}: ${notification.message}`,
            icon: '/public/images/logo_vpower.png',
            tag: `negotiation-${data.bidId}`,
            data: { bidId: data.bidId, type: 'negotiation' }
          });
        }
      }
    });

    // Also listen for bid negotiation updates (backward compatibility)
    socket.on('bid_negotiation_update', (data) => {
      console.log('📨 Bid negotiation update:', data);
      
      if (!bidId || data.bidId === bidId) {
        const notification = {
          id: Date.now(),
          bidId: data.bidId,
          sender: data.senderName || 'System',
          message: data.message || 'Negotiation updated',
          timestamp: new Date().toISOString(),
          type: 'negotiation_update'
        };

        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    });

    // Cleanup on unmount
    return () => {
      if (bidId) {
        socket.emit('leave_bid_negotiation', bidId);
      }
      socket.disconnect();
    };
  }, [user, bidId]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Browser notification permission granted');
        }
      });
    }
  }, []);

  return {
    isConnected,      // Boolean: socket connection status
    newMessage,       // Object: latest message received
    notifications,    // Array: all notifications
    refreshNegotiation: () => setNewMessage(null),
    clearNotifications: () => setNotifications([])
  };
};