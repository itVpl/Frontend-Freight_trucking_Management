import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ModernPopupTester = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const testModernChatPopup = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const chatData = {
      senderId: 'driver_' + Math.floor(Math.random() * 1000),
      senderName: 'John Driver',
      message: 'Hey! I have a question about the pickup location. Can you confirm the exact address?',
      loadId: 'load_' + Date.now(),
      avatar: null,
      timestamp: new Date().toISOString()
    };

    // Emit the event that ModernChatPopup listens for
    socket.emit('new_message', chatData);
    console.log('🧪 Testing modern chat popup:', chatData);
  };

  const testNegotiationNotification = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const negotiationData = {
      senderId: 'shipper_' + Math.floor(Math.random() * 1000),
      senderName: 'ABC Logistics',
      message: 'Counter offer: $3,200 for the Chicago to Dallas route',
      rate: 3200,
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      sender: 'shipper',
      timestamp: new Date().toISOString()
    };

    socket.emit('new_negotiation_message', negotiationData);
    console.log('🧪 Testing negotiation notification:', negotiationData);
  };

  const testBidNotification = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const bidData = {
      senderId: 'driver_' + Math.floor(Math.random() * 1000),
      senderName: 'Mike Trucker',
      message: 'New bid submitted',
      rate: Math.floor(Math.random() * 1000) + 2500,
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      status: 'PendingApproval',
      timestamp: new Date().toISOString()
    };

    socket.emit('new_bid', bidData);
    console.log('🧪 Testing bid notification:', bidData);
  };

  const testLoadUpdate = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const loadData = {
      senderId: 'system',
      senderName: 'System',
      message: 'Load status changed to "In Transit"',
      loadId: 'load_' + Date.now(),
      status: 'In Transit',
      timestamp: new Date().toISOString()
    };

    socket.emit('load_update', loadData);
    console.log('🧪 Testing load update:', loadData);
  };

  const testMultipleNotifications = () => {
    // Test multiple notifications in sequence
    setTimeout(() => testModernChatPopup(), 0);
    setTimeout(() => testNegotiationNotification(), 1000);
    setTimeout(() => testBidNotification(), 2000);
    setTimeout(() => testLoadUpdate(), 3000);
  };

  return (
    <div className="fixed top-4 left-4 z-[9999] bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800">Modern Popup Tester</h3>
        <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        Test the new modern popup system with realistic data and animations.
      </div>

      <div className="space-y-2">
        <button
          onClick={testModernChatPopup}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          💬 Modern Chat Popup
        </button>
        
        <button
          onClick={testNegotiationNotification}
          className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          💰 Negotiation Notification
        </button>
        
        <button
          onClick={testBidNotification}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🎯 Bid Notification
        </button>
        
        <button
          onClick={testLoadUpdate}
          className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🚛 Load Update
        </button>
        
        <button
          onClick={testMultipleNotifications}
          className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🎭 Test All (Sequence)
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Socket: {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {socket?.id && (
          <div className="text-xs text-gray-400">
            ID: {socket.id.slice(-8)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPopupTester;