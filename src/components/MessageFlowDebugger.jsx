import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const MessageFlowDebugger = () => {
  const [messageLog, setMessageLog] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // Log all negotiation events to understand the flow
    const logEvent = (eventName, data, direction) => {
      const currentUserId = user._id || user.userId || user.empId;
      const senderId = data.senderId || data.userId || data.from;
      
      const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        eventName,
        direction, // 'sent' or 'received'
        senderId,
        senderName: data.senderName || 'Unknown',
        message: data.message || 'No message',
        rate: data.rate,
        isOwnMessage: senderId === currentUserId,
        shouldShowPopup: senderId !== currentUserId && direction === 'received',
        data: data
      };

      setMessageLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    };

    // Listen for all negotiation events
    const events = [
      'internal_negotiation_update',
      'shipper_internal_negotiate', 
      'inhouse_internal_negotiate',
      'bid_negotiation_update',
      'new_negotiation_message'
    ];

    events.forEach(eventName => {
      socket.on(eventName, (data) => {
        logEvent(eventName, data, 'received');
      });
    });

    // Also log when we send events (for debugging)
    const originalEmit = socket.emit;
    socket.emit = function(eventName, data, ...args) {
      if (events.includes(eventName)) {
        logEvent(eventName, data, 'sent');
      }
      return originalEmit.call(this, eventName, data, ...args);
    };

    return () => {
      events.forEach(eventName => {
        socket.off(eventName);
      });
      socket.emit = originalEmit; // Restore original emit
    };
  }, [socket, user]);

  const clearLog = () => {
    setMessageLog([]);
  };

  if (messageLog.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xs text-gray-800">Message Flow Debugger</h3>
        <button
          onClick={clearLog}
          className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
        >
          Clear
        </button>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        Current User: {user?.name || user?.email || 'Unknown'} ({user?._id?.slice(-6) || 'No ID'})
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {messageLog.map(entry => (
          <div 
            key={entry.id} 
            className={`p-2 rounded text-xs border ${
              entry.direction === 'sent' 
                ? 'bg-blue-50 border-blue-200' 
                : entry.shouldShowPopup 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">
                {entry.direction === 'sent' ? '📤 SENT' : '📥 RECEIVED'}
              </span>
              <span className="text-gray-500">{entry.timestamp}</span>
            </div>
            
            <div className="mb-1">
              <span className="font-medium">{entry.eventName}</span>
              {entry.shouldShowPopup && (
                <span className="ml-2 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                  POPUP SHOWN
                </span>
              )}
              {entry.isOwnMessage && (
                <span className="ml-2 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                  OWN MESSAGE
                </span>
              )}
            </div>
            
            <div className="text-gray-700">
              <div><strong>From:</strong> {entry.senderName} ({entry.senderId?.slice(-6) || 'No ID'})</div>
              <div><strong>Message:</strong> {entry.message}</div>
              {entry.rate && <div><strong>Rate:</strong> ${entry.rate.toLocaleString()}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageFlowDebugger;