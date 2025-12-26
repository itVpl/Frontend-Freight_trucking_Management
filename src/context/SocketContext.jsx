import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { BASE_API_URL } from '../apiConfig';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (user && token) {
      console.log('🚀 Initializing WebSocket connection to:', BASE_API_URL);
      
      // Initialize socket connection
      const newSocket = io(BASE_API_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: false
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user-specific room based on user type
        if (user.userType === 'shipper' || user.type === 'shipper') {
          newSocket.emit('join_shipper', user._id || user.userId);
        } else if (user.empId) {
          newSocket.emit('join', user.empId);
        } else {
          newSocket.emit('join', user._id || user.userId);
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
        setConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log('🧹 Cleaning up socket connection');
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      connected
    }}>
      {children}
    </SocketContext.Provider>
  );
};