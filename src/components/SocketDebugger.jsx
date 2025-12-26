import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useMessageNotifications } from '../context/MessageNotificationContext';
import { useAuth } from '../context/AuthContext';

const SocketDebugger = () => {
  const { socket, connected } = useSocket();
  const messageNotifications = useMessageNotifications();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const addLog = (message) => {
      setLogs(prev => [...prev.slice(-19), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    addLog(`Socket: ${connected ? 'Connected' : 'Disconnected'}`);
    addLog(`User: ${user?.name || user?.email || 'Not logged in'}`);
    addLog(`MessageNotifications: ${messageNotifications ? 'Available' : 'Not available'}`);

    // Listen to all socket events for debugging
    if (socket) {
      const handleAnyEvent = (eventName, ...args) => {
        setEventCount(prev => prev + 1);
        addLog(`Event: ${eventName} - ${JSON.stringify(args[0])?.substring(0, 50)}...`);
      };

      socket.onAny(handleAnyEvent);

      return () => {
        socket.offAny(handleAnyEvent);
      };
    }
  }, [connected, user, messageNotifications, socket]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-4 z-[9998] bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
      >
        Debug {isVisible ? '🔽' : '🔼'} ({eventCount})
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed top-12 left-4 z-[9997] bg-gray-900 text-green-400 p-3 rounded-lg shadow-lg max-w-md text-xs font-mono max-h-96 overflow-hidden">
          <div className="mb-2 text-white font-bold">Socket Debug Info</div>
          
          <div className="space-y-1 mb-3">
            <div>🔌 Socket: <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? 'Connected' : 'Disconnected'}</span></div>
            <div>👤 User: {user?.name || user?.email || 'Not logged in'}</div>
            <div>📢 Notifications: <span className={messageNotifications ? 'text-green-400' : 'text-red-400'}>{messageNotifications ? 'Ready' : 'Not ready'}</span></div>
            <div>📊 Events: {eventCount}</div>
          </div>

          <div className="border-t border-gray-700 pt-2">
            <div className="text-white font-bold mb-1 flex justify-between">
              <span>Recent Events:</span>
              <button 
                onClick={() => {setLogs([]); setEventCount(0);}}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Clear
              </button>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs break-words">{log}</div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500 text-xs">No events yet...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocketDebugger;