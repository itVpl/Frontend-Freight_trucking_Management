import React from 'react';
import { useSocket } from '../context/SocketContext';

const NegotiationTestButton = () => {
  const { socket } = useSocket();

  const sendTestNotification = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const testData = {
      bidId: 'test-bid-123',
      loadId: 'test-load-456',
      sender: 'shipper',
      senderName: 'Test Shipper',
      message: 'Can we negotiate this rate? I think $1500 would be fair.',
      rate: 1500,
      timestamp: new Date().toISOString(),
      type: 'shipper_negotiation'
    };

    socket.emit('test_negotiation_message', testData);
    
    setTimeout(() => {
      socket.emit('new_negotiation_message', testData);
    }, 1000);

    console.log('Test negotiation message sent:', testData);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        onClick={sendTestNotification}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      >
        🧪 Test Negotiation Popup
      </button>
    </div>
  );
};

export default NegotiationTestButton;