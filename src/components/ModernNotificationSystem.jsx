import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModernNotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    // Handle different types of notifications
    const handleNotification = (data, type) => {
      console.log(`🔔 New ${type} notification:`, data);
      
      // Skip own messages
      if (data.senderId === user._id || data.senderId === user.userId) {
        return;
      }

      let notification = {
        id: Date.now() + Math.random(),
        type: type,
        senderId: data.senderId,
        senderName: data.senderName || data.sender?.name || getDefaultSenderName(type),
        message: data.message || data.content || getDefaultMessage(data, type),
        timestamp: new Date(),
        avatar: data.avatar || data.sender?.avatar,
        loadId: data.loadId,
        bidId: data.bidId,
        rate: data.rate,
        isRead: false,
        priority: getPriority(type)
      };

      // Customize based on type
      switch (type) {
        case 'negotiation':
          notification.icon = '💰';
          notification.color = 'green';
          notification.title = 'Negotiation Update';
          break;
        case 'bid':
          notification.icon = '🎯';
          notification.color = 'blue';
          notification.title = 'New Bid Received';
          break;
        case 'chat':
          notification.icon = '💬';
          notification.color = 'purple';
          notification.title = 'New Message';
          break;
        case 'load':
          notification.icon = '🚛';
          notification.color = 'orange';
          notification.title = 'Load Update';
          break;
        default:
          notification.icon = '📢';
          notification.color = 'gray';
          notification.title = 'Notification';
      }

      setNotifications(prev => {
        // Remove old notifications from same sender for chat/negotiation
        const filtered = (type === 'chat' || type === 'negotiation') 
          ? prev.filter(n => n.senderId !== data.senderId || n.type !== type)
          : prev;
        
        return [notification, ...filtered].slice(0, 6);
      });

      // Auto remove based on priority
      const autoRemoveTime = notification.priority === 'high' ? 12000 : 8000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, autoRemoveTime);

      // Browser notification
      showBrowserNotification(notification);
      
      // Play sound
      playNotificationSound(type);
    };

    const getDefaultSenderName = (type) => {
      switch (type) {
        case 'negotiation': return 'Negotiation Team';
        case 'bid': return 'Driver';
        case 'chat': return 'User';
        case 'load': return 'System';
        default: return 'Unknown';
      }
    };

    const getDefaultMessage = (data, type) => {
      switch (type) {
        case 'negotiation': 
          return data.rate ? `New rate: $${data.rate.toLocaleString()}` : 'Negotiation update';
        case 'bid': 
          return data.rate ? `Bid amount: $${data.rate.toLocaleString()}` : 'New bid received';
        case 'chat': 
          return 'New message received';
        case 'load': 
          return 'Load status updated';
        default: 
          return 'New notification';
      }
    };

    const getPriority = (type) => {
      switch (type) {
        case 'negotiation': return 'high';
        case 'bid': return 'high';
        case 'chat': return 'medium';
        case 'load': return 'medium';
        default: return 'low';
      }
    };

    // Register event listeners
    const eventHandlers = {
      // Negotiation events
      'new_negotiation_message': (data) => handleNotification(data, 'negotiation'),
      'bid_negotiation_update': (data) => handleNotification(data, 'negotiation'),
      'negotiation_message': (data) => handleNotification(data, 'negotiation'),
      
      // Bid events
      'new_bid': (data) => handleNotification(data, 'bid'),
      'bid_update': (data) => handleNotification(data, 'bid'),
      'bid_received': (data) => handleNotification(data, 'bid'),
      
      // Chat events
      'new_message': (data) => handleNotification(data, 'chat'),
      'receive_message': (data) => handleNotification(data, 'chat'),
      'chat_message': (data) => handleNotification(data, 'chat'),
      'message_received': (data) => handleNotification(data, 'chat'),
      
      // Load events
      'load_update': (data) => handleNotification(data, 'load'),
      'load_assigned': (data) => handleNotification(data, 'load'),
      'load_completed': (data) => handleNotification(data, 'load'),
      'load_status_changed': (data) => handleNotification(data, 'load')
    };

    // Register all listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, user]);

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(`${notification.icon} ${notification.title}`, {
        body: `${notification.senderName}: ${notification.message}`,
        icon: '/public/images/logo_vpower.png',
        tag: `${notification.type}-${notification.senderId}`,
        data: { 
          loadId: notification.loadId, 
          bidId: notification.bidId,
          type: notification.type 
        }
      });

      browserNotif.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
        browserNotif.close();
      };

      setTimeout(() => browserNotif.close(), 6000);
    }
  };

  const playNotificationSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      let frequencies;
      switch (type) {
        case 'negotiation':
          frequencies = [800, 1000, 800]; // Higher pitch for important
          break;
        case 'bid':
          frequencies = [600, 800, 600]; // Medium pitch
          break;
        case 'chat':
          frequencies = [400, 600, 400]; // Lower pitch for chat
          break;
        default:
          frequencies = [500, 700, 500];
      }
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
      });
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.loadId) {
      navigate(`/loadboard?loadId=${notification.loadId}`);
    } else if (notification.bidId) {
      navigate(`/loadboard?bidId=${notification.bidId}`);
    } else {
      navigate('/loadboard');
    }
    
    // Mark as read and remove
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const dismissNotification = (id, event) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const getColorClasses = (color, isHover = false) => {
    const colors = {
      green: isHover ? 'bg-green-50 border-green-200' : 'bg-green-50/80 border-green-100',
      blue: isHover ? 'bg-blue-50 border-blue-200' : 'bg-blue-50/80 border-blue-100',
      purple: isHover ? 'bg-purple-50 border-purple-200' : 'bg-purple-50/80 border-purple-100',
      orange: isHover ? 'bg-orange-50 border-orange-200' : 'bg-orange-50/80 border-orange-100',
      gray: isHover ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/80 border-gray-100'
    };
    return colors[color] || colors.gray;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {/* Header */}
      {notifications.length > 1 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {notifications.filter(n => !n.isRead).length} new notifications
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            >
              Mark Read
            </button>
            <button
              onClick={dismissAll}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`
            group relative cursor-pointer transform transition-all duration-300 
            hover:scale-[1.02] hover:shadow-xl animate-slide-in-right
            ${getColorClasses(notification.color)} hover:${getColorClasses(notification.color, true)}
            rounded-xl border-2 backdrop-blur-sm overflow-hidden
            ${!notification.isRead ? 'ring-2 ring-blue-500/20' : ''}
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Priority indicator */}
          {notification.priority === 'high' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          )}

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div className="text-2xl">{notification.icon}</div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {notification.senderName} • {getTimeAgo(notification.timestamp)}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={(e) => dismissNotification(notification.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message */}
            <div className="mb-2">
              <p className="text-gray-800 text-sm leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.rate && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    ${notification.rate.toLocaleString()}
                  </span>
                )}
                {notification.loadId && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Load #{notification.loadId.slice(-6)}
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view →
              </div>
            </div>
          </div>

          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ModernNotificationSystem;