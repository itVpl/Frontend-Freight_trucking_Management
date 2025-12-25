// context/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useNegotiation } from './NegotiationContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { addNotification } = useNegotiation();

  // Load saved notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatNotifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.notifications || []);
      setUnreadCount(parsed.unreadCount || 0);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('chatNotifications', JSON.stringify({
      notifications,
      unreadCount
    }));
  }, [notifications, unreadCount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Browser notification permission granted');
          }
        });
      }
    }
  }, []);

  // Socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    // Listen for new chat/negotiation messages
    socket.on('new_chat_message', (data) => {
      console.log('New chat message received:', data);
      
      const notification = {
        id: Date.now(),
        type: 'chat',
        senderId: data.senderId,
        senderName: data.senderName || 'User',
        message: data.message,
        chatId: data.chatId,
        timestamp: new Date(),
        read: false,
        redirectTo: `/chat/${data.chatId}` // URL to redirect when clicked
      };

      addNewNotification(notification);
      showBrowserNotification(notification);
    });

    // Listen for bid updates
    socket.on('bid_update', (data) => {
      const notification = {
        id: Date.now(),
        type: 'bid',
        loadId: data.loadId,
        bidId: data.bidId,
        message: `Bid ${data.status} by ${data.driverName || 'Driver'}`,
        timestamp: new Date(),
        read: false,
        redirectTo: `/load-board`
      };

      addNewNotification(notification);
      showBrowserNotification(notification);
    });

    // Listen for negotiation messages (specific to your existing system)
    socket.on('new_negotiation_message', (data) => {
      const notification = {
        id: Date.now(),
        type: 'negotiation',
        bidId: data.bidId,
        senderName: data.sender || 'User',
        message: data.message,
        timestamp: new Date(),
        read: false,
        redirectTo: `/negotiation/${data.bidId}`
      };

      addNewNotification(notification);
      showBrowserNotification(notification);
      
      // Also update negotiation context if needed
      if (addNotification) {
        addNotification(data.bidId);
      }
    });

    // Cleanup
    return () => {
      socket.off('new_chat_message');
      socket.off('bid_update');
      socket.off('new_negotiation_message');
    };
  }, [socket, addNotification]);

  // Add new notification
  const addNewNotification = (notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, 50); // Keep last 50
      return newNotifications;
    });
    
    setUnreadCount(prev => prev + 1);
    
    // Play sound
    playNotificationSound();
    
    // Update tab title
    updateTabTitle();
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = notification.type === 'chat' 
        ? `💬 ${notification.senderName}`
        : notification.type === 'bid'
        ? '🚚 New Bid Update'
        : '🤝 Negotiation Update';
      
      const options = {
        body: notification.message.length > 100 
          ? notification.message.substring(0, 100) + '...' 
          : notification.message,
        icon: '/logo.png',
        tag: `${notification.type}-${notification.id}`,
        data: notification // Store full notification data
      };

      const browserNotification = new Notification(title, options);
      
      // Handle click on notification
      browserNotification.onclick = () => {
        window.focus();
        if (notification.redirectTo) {
          window.location.href = notification.redirectTo;
        }
        browserNotification.close();
      };
      
      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound notification error:', error);
    }
  };

  // Update tab title with notification count
  const updateTabTitle = () => {
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    if (unreadCount > 0) {
      document.title = `(${unreadCount + 1}) ${originalTitle}`;
    } else {
      document.title = `(1) ${originalTitle}`;
    }
    
    // Reset after 10 seconds
    setTimeout(() => {
      if (unreadCount > 0) {
        document.title = `(${unreadCount}) ${originalTitle}`;
      } else {
        document.title = originalTitle;
      }
    }, 10000);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Update tab title
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    const newCount = unreadCount - 1;
    if (newCount > 0) {
      document.title = `(${newCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
    
    // Reset tab title
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = originalTitle;
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    
    // Reset tab title
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = originalTitle;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNewNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      showBrowserNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};