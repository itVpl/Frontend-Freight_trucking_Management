import React from 'react';
import { useSocket } from '../context/SocketContext';

const NegotiationThreadTester = () => {
  const { socket, connected } = useSocket();

  const testNegotiationThreadAccessed = () => {
    if (!socket || !connected) {
      alert('Socket not connected!');
      return;
    }

    // Simulate the event that your backend sends
    const testData = {
      bidId: 'test_bid_123',
      accessedBy: 'shipper',
      accessedByUserId: 'user_456',
      timestamp: new Date(),
      unreadStatus: {
        shipper: 2,
        inhouse: 1
      }
    };

    // Emit the event to test (this simulates what your backend does)
    socket.emit('negotiation_thread_accessed', testData);
    
    console.log('Test event emitted:', testData);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="font-bold mb-2">Negotiation Thread Tester</h3>
        <div className="space-y-2">
          <div className="text-sm">
            Socket Status: 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={testNegotiationThreadAccessed}
            disabled={!connected}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Test Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default NegotiationThreadTester;