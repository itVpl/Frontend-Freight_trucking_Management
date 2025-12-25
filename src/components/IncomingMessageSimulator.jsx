import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const IncomingMessageSimulator = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, success = true) => {
    const result = {
      id: Date.now(),
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev.slice(0, 3)]);
  };

  // Simulate message FROM DRIVER TO YOU (shipper)
  const simulateDriverMessage = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    const driverMessage = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'driver_john_' + Math.floor(Math.random() * 1000), // DIFFERENT from your ID
      senderName: 'John Driver', // DIFFERENT from your name
      message: 'Hi! I can do this load for $2,800. When do you need it picked up?',
      rate: 2800,
      timestamp: new Date().toISOString(),
      negotiationType: 'driver_message',
      sender: 'trucker', // FROM DRIVER
      // Explicitly mark as NOT your message
      isOwnMessage: false,
      receivedBy: user._id || user.userId
    };

    console.log('🚛 Simulating INCOMING message from driver:', driverMessage);
    socket.emit('internal_negotiation_update', driverMessage);
    addTestResult('✅ Driver message sent (should show popup)', true);
  };

  // Simulate message FROM SALES TEAM TO YOU
  const simulateSalesMessage = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    const salesMessage = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'sales_manager_' + Math.floor(Math.random() * 100), // DIFFERENT from your ID
      senderName: 'Sales Manager', // DIFFERENT from your name
      message: 'We have approved the rate of $3,100 for this shipment. Please confirm.',
      rate: 3100,
      timestamp: new Date().toISOString(),
      negotiationType: 'sales_approval',
      sender: 'inhouse', // FROM SALES TEAM
      // Explicitly mark as NOT your message
      isOwnMessage: false,
      receivedBy: user._id || user.userId
    };

    console.log('🏢 Simulating INCOMING message from sales:', salesMessage);
    socket.emit('inhouse_internal_negotiate', salesMessage);
    addTestResult('✅ Sales message sent (should show popup)', true);
  };

  // Simulate message FROM ANOTHER SHIPPER TO YOU (if you're sales/inhouse)
  const simulateShipperMessage = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    const shipperMessage = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'shipper_abc_' + Math.floor(Math.random() * 100), // DIFFERENT from your ID
      senderName: 'ABC Logistics', // DIFFERENT from your name
      message: 'Can we negotiate the rate to $2,950? This is urgent shipment.',
      rate: 2950,
      timestamp: new Date().toISOString(),
      negotiationType: 'shipper_request',
      sender: 'shipper', // FROM SHIPPER
      // Explicitly mark as NOT your message
      isOwnMessage: false,
      receivedBy: user._id || user.userId
    };

    console.log('🚢 Simulating INCOMING message from shipper:', shipperMessage);
    socket.emit('shipper_internal_negotiate', shipperMessage);
    addTestResult('✅ Shipper message sent (should show popup)', true);
  };

  // Simulate YOUR OWN MESSAGE (should NOT show popup)
  const simulateOwnMessage = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    const ownMessage = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: user._id || user.userId, // SAME as your ID
      senderName: user.name || user.email, // SAME as your name
      message: 'This is my own message - should NOT show popup',
      rate: 3000,
      timestamp: new Date().toISOString(),
      negotiationType: 'own_message',
      sender: user.userType || user.type || 'shipper',
      // Explicitly mark as your own message
      isOwnMessage: true
    };

    console.log('👤 Simulating YOUR OWN message (should NOT show popup):', ownMessage);
    socket.emit('internal_negotiation_update', ownMessage);
    addTestResult('✅ Own message sent (should NOT show popup)', true);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800">Incoming Message Test</h3>
        <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        Test INCOMING messages only (should show popup)
      </div>

      <div className="space-y-2 mb-3">
        <button
          onClick={simulateDriverMessage}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🚛 Driver → You (Popup ✅)
        </button>
        
        <button
          onClick={simulateSalesMessage}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🏢 Sales → You (Popup ✅)
        </button>
        
        <button
          onClick={simulateShipperMessage}
          className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🚢 Shipper → You (Popup ✅)
        </button>
        
        <button
          onClick={simulateOwnMessage}
          className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          👤 You → Others (No Popup ❌)
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs font-semibold mb-1 text-gray-700">Results:</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {testResults.map(result => (
              <div key={result.id} className={`text-xs p-1 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div>{result.message}</div>
                <div className="text-gray-500 text-xs">{result.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Your ID: {user?._id?.slice(-6) || user?.userId?.slice(-6) || 'Unknown'}
        </div>
        <div className="text-xs text-gray-400">
          Type: {user?.userType || user?.type || 'Unknown'}
        </div>
      </div>
    </div>
  );
};

export default IncomingMessageSimulator;