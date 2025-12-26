// components/NotificationHandler.jsx
import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';

const NotificationHandler = () => {
  const { addNewNotification } = useNotification();
  const { socket } = useSocket();

  // Handle all real-time events
  useEffect(() => {
    if (!socket) return;

    // Generic chat message handler
    socket.on('message', (data) => {
      console.log('Generic message received:', data);
      
      const notification = {
        id: Date.now(),
        type: 'chat',
        senderId: data.senderId,
        senderName: data.senderName || 'User',
        message: data.content || data.message,
        timestamp: new Date(),
        read: false
      };
      
      addNewNotification(notification);
    });

    // Any other event you want to track
    socket.onAny((eventName, data) => {
      console.log(`Socket event: ${eventName}`, data);
      
      // You can add specific handling for different events
      if (eventName.includes('message') || eventName.includes('chat')) {
        const notification = {
          id: Date.now(),
          type: 'chat',
          senderName: data.sender || 'System',
          message: data.message || JSON.stringify(data),
          timestamp: new Date(),
          read: false
        };
        
        addNewNotification(notification);
      }
    });

    return () => {
      socket.off('message');
      socket.offAny();
    };
  }, [socket, addNewNotification]);

  // Update tab title on notification count change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - keep notification count in title
        // This is already handled in context
      } else {
        // Tab is visible - clear notification count from title
        const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
        document.title = originalTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export { NotificationHandler };