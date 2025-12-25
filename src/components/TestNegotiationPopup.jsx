import React from 'react';
import { useSocket } from '../context/SocketContext';

const TestNegotiationPopup = () => {
  const { socket } = useSocket();

  const testNegotiationPopup = () => {
    if (socket) {
      // Simulate the exact negotiation message format
      const testData = {
        bidId: '6949da1092b672b0e79d6d06',
        loadId: '6949da1092b672b0e79d6d06',
        senderId: 'test-shipper-123',
        senderName: 'ABC Logistics',
        sender: 'shipper',
        message: 'hiii',
        rate: 90,
        timestamp: new Date().toISOString(),
        senderAvatar: null,
        negotiationData: {
          bidId: '6949da1092b672b0e79d6d06',
          loadId: '6949da1092b672b0e79d6d06'
        }
      };

      console.log('🧪 Testing negotiation popup with data:', testData);
      socket.emit('new_negotiation_message', testData);
    } else {
      console.error('❌ Socket not connected');
    }
  };

  const testBidPopup = () => {
    if (socket) {
      const testData = {
        bidId: 'bid-123',
        loadId: 'load-456',
        senderId: 'driver-789',
        senderName: 'John Driver',
        driverName: 'John Driver',
        message: 'New bid placed',
        rate: 2500,
        status: 'PendingApproval',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Testing bid popup with data:', testData);
      socket.emit('new_bid', testData);
    }
  };

  const testChatPopup = () => {
    if (socket) {
      const testData = {
        senderId: 'user-123',
        senderName: 'Mike Johnson',
        message: 'Hey! I have a question about the pickup time',
        loadId: 'DL1252555',
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Testing chat popup with data:', testData);
      socket.emit('new_message', testData);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[1999] space-y-2">
      <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Test Popups</h3>
        
        <button
          onClick={testNegotiationPopup}
          className="w-full px-3 py-1.5 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
        >
          Test Negotiation
        </button>

        <button
          onClick={testBidPopup}
          className="w-full px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
        >
          Test Bid
        </button>

        <button
          onClick={testChatPopup}
          className="w-full px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Test Chat
        </button>
      </div>
    </div>
  );
};

export default TestNegotiationPopup;