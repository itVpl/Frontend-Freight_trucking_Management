import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useMessageNotifications } from '../context/MessageNotificationContext';

const RealSocketTester = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const { push } = useMessageNotifications();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, success = true) => {
    const result = {
      id: Date.now(),
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev.slice(0, 4)]);
  };

  const testSocketConnection = () => {
    if (!socket) {
      addTestResult('❌ Socket not initialized', false);
      return;
    }
    
    if (!connected) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    addTestResult('✅ Socket connected: ' + socket.id);
    
    // Test emit
    socket.emit('test_connection', { userId: user?._id, timestamp: Date.now() });
    addTestResult('📤 Test connection event sent');
  };

  const simulateNegotiationMessage = () => {
    if (!socket || !connected) {
      addTestResult('❌ Socket not available', false);
      return;
    }

    const negotiationData = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'driver_' + Math.floor(Math.random() * 1000),
      senderName: 'John Driver',
      message: 'I can do this load for $2,800',
      rate: 2800,
      sender: 'trucker',
      timestamp: new Date().toISOString(),
      negotiationData: {
        previousRate: 2500,
        newRate: 2800,
        reason: 'Fuel costs increased'
      }
    };

    // Emit the event that backend would emit
    socket.emit('new_negotiation_message', negotiationData);
    addTestResult('📤 Negotiation message simulated');

    // Also show popup directly
    setTimeout(() => {
      push({
        id: `real-socket-${Date.now()}`,
        senderId: negotiationData.senderId,
        senderName: negotiationData.senderName,
        message: `💰 ${negotiationData.message}`,
        avatarUrl: null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 10000,
        negotiationData: negotiationData
      });
    }, 500);
  };

  const simulateBidReceived = () => {
    if (!socket || !connected) {
      addTestResult('❌ Socket not available', false);
      return;
    }

    const bidData = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'driver_' + Math.floor(Math.random() * 1000),
      senderName: 'Mike Trucker',
      driverName: 'Mike Trucker',
      rate: Math.floor(Math.random() * 1000) + 2000,
      status: 'PendingApproval',
      timestamp: new Date().toISOString(),
      truckInfo: {
        type: 'Dry Van',
        capacity: '53ft'
      }
    };

    socket.emit('new_bid', bidData);
    addTestResult('📤 New bid simulated');

    setTimeout(() => {
      push({
        id: `bid-socket-${Date.now()}`,
        senderId: bidData.senderId,
        senderName: bidData.senderName,
        message: `🎯 New Bid: $${bidData.rate.toLocaleString()}`,
        avatarUrl: null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 8000
      });
    }, 500);
  };

  const simulateChatMessage = () => {
    if (!socket || !connected) {
      addTestResult('❌ Socket not available', false);
      return;
    }

    const chatData = {
      senderId: 'sales_' + Math.floor(Math.random() * 100),
      senderName: 'Sales Team',
      message: 'Can we discuss the pickup schedule for tomorrow?',
      loadId: 'load_' + Date.now(),
      timestamp: new Date().toISOString(),
      messageType: 'text'
    };

    socket.emit('new_message', chatData);
    addTestResult('📤 Chat message simulated');

    setTimeout(() => {
      push({
        id: `chat-socket-${Date.now()}`,
        senderId: chatData.senderId,
        senderName: chatData.senderName,
        message: `💬 ${chatData.message}`,
        avatarUrl: null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 8000
      });
    }, 500);
  };

  const testBackendPing = () => {
    if (!socket || !connected) {
      addTestResult('❌ Socket not available', false);
      return;
    }

    // Test if backend responds
    socket.emit('ping', { timestamp: Date.now() });
    
    const timeout = setTimeout(() => {
      addTestResult('⏰ Backend ping timeout', false);
    }, 5000);

    socket.once('pong', (data) => {
      clearTimeout(timeout);
      addTestResult('🏓 Backend responded to ping');
    });

    addTestResult('📤 Ping sent to backend');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Real Socket Tester</h3>
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
        {socket && <div>ID: {socket.id?.slice(-6)}</div>}
      </div>

      <div className="space-y-2 mb-3">
        <button
          onClick={testSocketConnection}
          className="block w-full px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
        >
          Test Connection
        </button>
        <button
          onClick={simulateNegotiationMessage}
          className="block w-full px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
        >
          Simulate Negotiation
        </button>
        <button
          onClick={simulateBidReceived}
          className="block w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
        >
          Simulate New Bid
        </button>
        <button
          onClick={simulateChatMessage}
          className="block w-full px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
        >
          Simulate Chat
        </button>
        <button
          onClick={testBackendPing}
          className="block w-full px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
        >
          Test Backend Ping
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs font-semibold mb-1">Test Results:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {testResults.map(result => (
              <div key={result.id} className={`text-xs p-1 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div>{result.message}</div>
                <div className="text-gray-500">{result.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealSocketTester;