import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const SocketConnectionTest = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testBackendConnection = () => {
    if (socket) {
      console.log('🧪 Testing backend socket connection...');
      
      // Test if backend is listening by emitting a test event
      socket.emit('test_connection', {
        userId: user?._id || user?.userId,
        message: 'Frontend connection test',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Test event sent to backend');
    } else {
      console.error('❌ Socket not connected');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1999]">
      <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-700">
          Socket Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        
        <button
          onClick={testBackendConnection}
          className="w-full px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Test Backend
        </button>
      </div>
    </div>
  );
};

export default SocketConnectionTest;