import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const MessageDirectionIndicator = () => {
  const [lastActivity, setLastActivity] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // Monitor all negotiation events
    const handleEvent = (eventName, data, direction) => {
      const currentUserId = user._id || user.userId || user.empId;
      const senderId = data.senderId || data.userId;
      const isOwnMessage = senderId === currentUserId || data.isOwnMessage === true;
      
      const activity = {
        id: Date.now(),
        timestamp: new Date(),
        direction: isOwnMessage ? 'sent' : 'received',
        eventName,
        senderName: data.senderName || 'Unknown',
        message: data.message || 'No message',
        shouldShowPopup: !isOwnMessage && direction === 'received'
      };

      setLastActivity(activity);
      
      // Auto clear after 5 seconds
      setTimeout(() => {
        setLastActivity(null);
      }, 5000);
    };

    // Listen for negotiation events
    const events = [
      'internal_negotiation_update',
      'shipper_internal_negotiate', 
      'inhouse_internal_negotiate',
      'bid_negotiation_update'
    ];

    events.forEach(eventName => {
      socket.on(eventName, (data) => {
        handleEvent(eventName, data, 'received');
      });
    });

    return () => {
      events.forEach(eventName => {
        socket.off(eventName);
      });
    };
  }, [socket, user]);

  if (!lastActivity) {
    return null;
  }

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-[9999]">
      <div className={`
        p-3 rounded-lg shadow-lg border-2 transition-all duration-300 animate-pulse
        ${lastActivity.direction === 'sent' 
          ? 'bg-blue-50 border-blue-300 text-blue-800' 
          : 'bg-green-50 border-green-300 text-green-800'
        }
      `}>
        <div className="flex items-center space-x-2 mb-1">
          <div className="text-lg">
            {lastActivity.direction === 'sent' ? '📤' : '📥'}
          </div>
          <div className="font-bold text-sm">
            {lastActivity.direction === 'sent' ? 'MESSAGE SENT' : 'MESSAGE RECEIVED'}
          </div>
        </div>
        
        <div className="text-xs">
          <div><strong>From:</strong> {lastActivity.senderName}</div>
          <div><strong>Time:</strong> {lastActivity.timestamp.toLocaleTimeString()}</div>
        </div>
        
        {lastActivity.shouldShowPopup && (
          <div className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            ✅ POPUP SHOWN
          </div>
        )}
        
        {lastActivity.direction === 'sent' && (
          <div className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            ❌ NO POPUP (YOUR MESSAGE)
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDirectionIndicator;