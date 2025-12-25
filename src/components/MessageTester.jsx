import React from 'react';
import { useSocket } from '../context/SocketContext';

const MessageTester = () => {
  const { socket } = useSocket();

  const testNegotiationMessage = () => {
    if (socket) {
      // Simulate the exact event your backend sends with realistic broker names
      const brokerNames = [
        'Shyam Singh (VPL003)',
        'Rajesh Kumar (TRK007)', 
        'Amit Singh (DRV012)',
        'Pradeep Sharma (BRK045)',
        'Vikash Yadav (VPL089)'
      ];
      
      const randomBroker = brokerNames[Math.floor(Math.random() * brokerNames.length)];
      
      const testData = {
        bidId: 'test-bid-123',
        loadId: 'DL1252555',
        senderId: 'test-driver-789',
        senderName: randomBroker,
        sender: randomBroker,
        senderType: 'Broker',
        message: `Hello! I'm ${randomBroker}. I can handle your Delhi to Mumbai load for ₹85,000. My truck is ready and I have all permits. Please consider my bid.`,
        rate: 85000,
        timestamp: new Date().toISOString(),
        senderAvatar: null
      };

      console.log('🧪 Emitting test negotiation message:', testData);
      socket.emit('new_negotiation_message', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  const testBidMessage = () => {
    if (socket) {
      // Simulate the exact bid event your backend sends
      const testData = {
        loadId: 'test-load-456',
        senderId: 'test-driver-789',
        driverName: 'Sarah Wilson',
        rate: 2500,
        message: 'New bid submitted',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Emitting test bid message:', testData);
      socket.emit('new_bid', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  const testChatMessage = () => {
    if (socket) {
      // Simulate the exact chat event your backend sends with Indian broker names
      const brokerNames = [
        'Shyam Singh (VPL156)',
        'Manish Agarwal (TRK234)', 
        'Deepak Verma (DRV567)',
        'Rohit Jain (BRK890)',
        'Sanjay Patel (VPL445)'
      ];
      
      const randomBroker = brokerNames[Math.floor(Math.random() * brokerNames.length)];
      
      const testData = {
        senderId: 'test-user-123',
        senderName: randomBroker,
        sender: randomBroker,
        senderType: 'Broker',
        message: `Namaste! ${randomBroker} here. I'm interested in your Pune to Bangalore load. Can we discuss the rate? I have a 32ft trailer available.`,
        loadId: 'DL1252555',
        rate: 75000,
        timestamp: new Date().toISOString(),
        avatarUrl: null
      };

      console.log('🧪 Emitting test chat message:', testData);
      socket.emit('new_message', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  const testShyamSinghMessage = () => {
    if (socket) {
      // Test message with no sender to verify "Shyam Singh" appears as default
      const testData = {
        message: 'Hello! I am interested in your load posting. Please check my competitive rates.',
        loadId: 'DL1252555',
        rate: 88000,
        timestamp: new Date().toISOString()
        // No sender field - should default to "Shyam Singh"
      };

      console.log('🧪 Emitting test message (should show Shyam Singh as default):', testData);
      socket.emit('new_message', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  const testAlertOnly = () => {
    if (socket) {
      // Simulate a simple message to test just the alert with broker name
      const brokerNames = [
        'Shyam Singh (VPL003)',
        'Ravi Sharma (TRK007)', 
        'Nikhil Gupta (DRV012)',
        'Ajay Singh (BRK045)',
        'Kiran Patel (VPL089)'
      ];
      
      const randomBroker = brokerNames[Math.floor(Math.random() * brokerNames.length)];
      
      const testData = {
        sender: randomBroker,
        senderName: randomBroker,
        senderType: 'Broker',
        message: `Hello! This is ${randomBroker}. I have seen your load posting and I'm very interested. My rate is competitive and truck is ready for immediate dispatch.`,
        loadId: 'DL1252555',
        rate: 92000,
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Emitting test alert message:', testData);
      socket.emit('new_message', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[1999] space-y-2">
      <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Test Real Events</h3>
        
        <button
          onClick={testShyamSinghMessage}
          className="w-full px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
        >
          🎯 Test Shyam Singh Default
        </button>
        
        <button
          onClick={testAlertOnly}
          className="w-full px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          🚨 Test Broker Alert
        </button>

        <button
          onClick={testNegotiationMessage}
          className="w-full px-3 py-1.5 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
        >
          Negotiation Msg
        </button>

        <button
          onClick={testBidMessage}
          className="w-full px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
        >
          New Bid
        </button>

        <button
          onClick={testChatMessage}
          className="w-full px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Chat Message
        </button>
      </div>
    </div>
  );
};

export default MessageTester;