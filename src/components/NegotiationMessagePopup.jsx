import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NegotiationMessagePopup = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleNegotiationMessage = (data) => {
      console.log('💰 Negotiation message received:', data);
      
      // Skip if message is from current user
      if (data.senderId === user?._id || data.senderId === user?.userId || data.senderId === user?.empId) {
        return;
      }

      // Create notification object
      const notification = {
        id: `negotiation-${Date.now()}-${Math.random()}`,
        type: 'negotiation',
        title: 'New Negotiation Message',
        loadId: data.loadId || 'Unknown Load',
        from: data.sender === 'shipper' ? 'Shipper' : data.sender === 'inhouse' ? 'Sales Team' : data.senderName || 'Unknown',
        rate: data.rate ? `$${data.rate}` : 'Rate not specified',
        message: data.message || 'No message',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bidId: data.bidId,
        negotiationData: data.negotiationData || data,
        createdAt: Date.now()
      };

      // Add to notifications
      setNotifications(prev => [notification, ...prev]);

      // Auto remove after 15 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 15000);
    };

    const handleBidUpdate = (data) => {
      console.log('🎯 Bid update received:', data);
      
      // Skip if message is from current user
      if (data.senderId === user?._id || data.senderId === user?.userId) {
        return;
      }

      let title = 'New Bid Update';
      let message = data.message || 'Bid status updated';
      
      if (data.status === 'PendingApproval') {
        title = 'New Bid Received';
        message = `New bid placed by ${data.driverName || 'Driver'}`;
      } else if (data.status === 'Accepted') {
        title = 'Bid Accepted';
        message = `Your bid has been accepted`;
      } else if (data.status === 'Rejected') {
        title = 'Bid Rejected';
        message = `Your bid has been rejected`;
      }

      const notification = {
        id: `bid-${Date.now()}-${Math.random()}`,
        type: 'bid',
        title: title,
        loadId: data.loadId || 'Unknown Load',
        from: data.driverName || data.senderName || 'Driver',
        rate: data.rate ? `$${data.rate}` : 'Rate not specified',
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bidId: data.bidId,
        createdAt: Date.now()
      };

      setNotifications(prev => [notification, ...prev]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 15000);
    };

    const handleChatMessage = (data) => {
      console.log('💬 Chat message received:', data);
      
      if (data.senderId === user?._id || data.senderId === user?.userId) {
        return;
      }

      const notification = {
        id: `chat-${Date.now()}-${Math.random()}`,
        type: 'chat',
        title: 'New Message',
        loadId: data.loadId || 'General Chat',
        from: data.senderName || 'Unknown User',
        rate: '', // No rate for chat messages
        message: data.message || data.content || 'New message received',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };

      setNotifications(prev => [notification, ...prev]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 12000);
    };

    // Register listeners
    socket.on('new_negotiation_message', handleNegotiationMessage);
    socket.on('bid_negotiation_update', handleNegotiationMessage);
    socket.on('negotiation_message', handleNegotiationMessage);
    socket.on('new_bid', handleBidUpdate);
    socket.on('bid_update', handleBidUpdate);
    socket.on('new_message', handleChatMessage);
    socket.on('receive_message', handleChatMessage);
    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('new_negotiation_message', handleNegotiationMessage);
      socket.off('bid_negotiation_update', handleNegotiationMessage);
      socket.off('negotiation_message', handleNegotiationMessage);
      socket.off('new_bid', handleBidUpdate);
      socket.off('bid_update', handleBidUpdate);
      socket.off('new_message', handleChatMessage);
      socket.off('receive_message', handleChatMessage);
      socket.off('chat_message', handleChatMessage);
    };
  }, [socket, user]);

  const handleViewNegotiation = (notification) => {
    // Navigate to loadboard and open negotiation
    navigate('/loadboard');
    
    // Close this notification
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const handleClose = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-[400px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {notification.type === 'negotiation' ? '💰' : 
                 notification.type === 'bid' ? '🎯' : '💬'}
              </span>
              <h3 className="text-white font-semibold text-sm">
                {notification.title}
              </h3>
            </div>
            <button
              onClick={() => handleClose(notification.id)}
              className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Load ID */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium text-sm">Load:</span>
              <span className="text-gray-800 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {notification.loadId}
              </span>
            </div>

            {/* From */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium text-sm">From:</span>
              <span className="text-gray-800 text-sm font-semibold">
                {notification.from}
              </span>
            </div>

            {/* Rate (if available) */}
            {notification.rate && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 text-lg">ℹ️</span>
                <span className="text-green-600 font-bold text-lg">
                  Rate: {notification.rate}
                </span>
              </div>
            )}

            {/* Message */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-gray-500 text-xs">
                <span>🕐</span>
                <span>{notification.timestamp}</span>
              </div>
              
              {/* Action Button */}
              {notification.type === 'negotiation' && (
                <button
                  onClick={() => handleViewNegotiation(notification)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  View Negotiation
                </button>
              )}
              
              {notification.type === 'bid' && (
                <button
                  onClick={() => handleViewNegotiation(notification)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  View Bid
                </button>
              )}
              
              {notification.type === 'chat' && (
                <button
                  onClick={() => handleViewNegotiation(notification)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  View Chat
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-linear"
              style={{
                animation: `shrink ${notification.type === 'chat' ? '12s' : '15s'} linear`
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default NegotiationMessagePopup;