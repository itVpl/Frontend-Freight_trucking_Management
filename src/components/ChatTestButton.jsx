import React from 'react';
import { useSocket } from '../context/SocketContext';

const ChatTestButton = () => {
  const { socket } = useSocket();

  const sendTestChatMessage = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const testChatData = {
      senderId: 'test-sender-123',
      senderName: 'John Doe (Shipper)',
      senderCompany: 'ABC Logistics Inc.',
      senderAvatar: null,
      message: 'Hi! I wanted to discuss the pickup time for this load. Can we schedule it for tomorrow morning around 8 AM?',
      loadId: 'LOAD-2024-001',
      load: {
        loadId: 'LOAD-2024-001',
        origin: {
          city: 'Los Angeles',
          state: 'CA',
          address: '1234 Main St, Los Angeles, CA 90210'
        },
        destination: {
          city: 'New York',
          state: 'NY', 
          address: '5678 Broadway, New York, NY 10001'
        },
        weight: 25000,
        rate: 3500,
        distance: 2800
      },
      loadDetails: {
        weight: 25000,
        rate: 3500,
        commodity: 'Electronics',
        equipment: 'Dry Van'
      },
      origin: 'Los Angeles, CA',
      destination: 'New York, NY',
      conversationId: 'conv-123',
      timestamp: new Date().toISOString()
    };

    socket.emit('new_message', testChatData);
    
    setTimeout(() => {
      socket.emit('receive_message', {
        ...testChatData,
        senderId: 'test-sender-456',
        senderName: 'Sarah Wilson (Trucker)',
        senderCompany: 'Wilson Transport LLC',
        message: 'Sure! 8 AM works perfectly. I\'ll be there with my truck. Do you need any special equipment for loading?',
        loadId: 'LOAD-2024-002'
      });
    }, 2000);

    console.log('Test chat messages sent:', testChatData);
  };

  return (
    <div className="fixed bottom-4 left-20 z-[9999]">
      <button
        onClick={sendTestChatMessage}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      >
        💬 Test Chat Popup
      </button>
    </div>
  );
};

export default ChatTestButton;