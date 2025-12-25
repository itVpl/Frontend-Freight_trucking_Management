import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';

const RealApiTester = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (message, success = true, data = null) => {
    const result = {
      id: Date.now(),
      message,
      success,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev.slice(0, 4)]);
  };

  const testRealNegotiationAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addTestResult('❌ No auth token found', false);
        return;
      }

      // First, get a real load to test with
      const loadsResponse = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const loads = loadsResponse.data?.loads || loadsResponse.data || [];
      if (loads.length === 0) {
        addTestResult('❌ No loads found to test with', false);
        return;
      }

      const testLoad = loads[0];
      addTestResult(`✅ Found test load: ${testLoad._id?.slice(-6)}`, true);

      // Try to get bids for this load
      try {
        const bidsResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/load/${testLoad._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bids = bidsResponse.data?.bids || [];
        if (bids.length > 0) {
          const testBid = bids[0];
          addTestResult(`✅ Found test bid: ${testBid._id?.slice(-6)}`, true);

          // Now test real negotiation API call
          const negotiationData = {
            bidId: testBid._id,
            loadId: testLoad._id,
            shipperCounterRate: Math.floor(Math.random() * 1000) + 2500,
            shipperNegotiationMessage: 'Can we discuss this rate? I think we can find a better deal.',
            negotiationType: 'shipper_counter'
          };

          // Simulate the real API call that would trigger socket events
          const negotiationResponse = await axios.post(
            `${BASE_API_URL}/api/v1/negotiation/shipper-internal-negotiate`,
            negotiationData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          addTestResult('✅ Real negotiation API called successfully', true, negotiationResponse.data);

          // Also emit socket event to test real-time
          if (socket) {
            const socketData = {
              bidId: testBid._id,
              loadId: testLoad._id,
              senderId: user._id || user.userId,
              senderName: user.name || user.email || 'Test Shipper',
              message: negotiationData.shipperNegotiationMessage,
              rate: negotiationData.shipperCounterRate,
              previousRate: testBid.rate,
              timestamp: new Date().toISOString(),
              negotiationType: 'shipper_counter'
            };

            socket.emit('shipper_internal_negotiate', socketData);
            addTestResult('✅ Socket event emitted for real-time popup', true);
          }

        } else {
          addTestResult('⚠️ No bids found, creating mock negotiation', true);
          
          // Create mock negotiation event
          const mockSocketData = {
            bidId: 'bid_' + Date.now(),
            loadId: testLoad._id,
            senderId: 'driver_' + Math.floor(Math.random() * 1000),
            senderName: 'John Driver',
            message: 'I can do this load for a better rate. Let me know!',
            rate: Math.floor(Math.random() * 1000) + 2000,
            timestamp: new Date().toISOString(),
            negotiationType: 'driver_counter'
          };

          if (socket) {
            socket.emit('internal_negotiation_update', mockSocketData);
            addTestResult('✅ Mock negotiation event sent', true);
          }
        }

      } catch (bidError) {
        addTestResult('⚠️ Could not fetch bids, using mock data', true);
        
        // Use mock data for testing
        const mockData = {
          bidId: 'bid_' + Date.now(),
          loadId: testLoad._id,
          senderId: 'test_user_' + Math.floor(Math.random() * 1000),
          senderName: 'Test Negotiator',
          message: 'Test negotiation message from API simulation',
          rate: Math.floor(Math.random() * 1000) + 2500,
          timestamp: new Date().toISOString()
        };

        if (socket) {
          socket.emit('internal_negotiation_update', mockData);
          addTestResult('✅ Test negotiation event sent', true);
        }
      }

    } catch (error) {
      console.error('Real API test error:', error);
      addTestResult(`❌ API test failed: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testSocketNegotiationEvent = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    // Simulate message FROM ANOTHER USER (not current user)
    const negotiationData = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'other_user_' + Math.floor(Math.random() * 1000), // Different from current user
      senderName: 'John Driver', // Different name
      message: 'Real-time negotiation update: Can we settle at this rate?',
      rate: Math.floor(Math.random() * 1500) + 2000,
      previousRate: Math.floor(Math.random() * 1000) + 1500,
      timestamp: new Date().toISOString(),
      threadId: 'thread_' + Date.now(),
      negotiationType: 'driver_counter', // From driver, not shipper
      sender: 'trucker' // Explicitly set as trucker
    };

    // Emit the exact event that RealTimeNegotiationListener listens for
    socket.emit('internal_negotiation_update', negotiationData);
    addTestResult('✅ Live negotiation event sent (from other user)', true, negotiationData);
  };

  const testMultipleNegotiations = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    // Simulate messages FROM DIFFERENT USERS (not current user)
    const negotiations = [
      {
        senderName: 'ABC Logistics (Shipper)',
        senderId: 'shipper_abc_123',
        message: 'Counter offer: $3,200 for Chicago to Dallas',
        rate: 3200,
        negotiationType: 'shipper_counter',
        sender: 'shipper'
      },
      {
        senderName: 'Mike Driver',
        senderId: 'driver_mike_456',
        message: 'I can do $2,800 if we can load tomorrow',
        rate: 2800,
        negotiationType: 'driver_counter',
        sender: 'trucker'
      },
      {
        senderName: 'Sales Team',
        senderId: 'sales_team_789',
        message: 'Final offer: $3,000 - this is our best rate',
        rate: 3000,
        negotiationType: 'inhouse_final',
        sender: 'inhouse'
      }
    ];

    negotiations.forEach((neg, index) => {
      setTimeout(() => {
        const data = {
          bidId: 'bid_' + Date.now() + '_' + index,
          loadId: 'load_' + Date.now(),
          senderId: neg.senderId, // Different sender IDs
          senderName: neg.senderName,
          message: neg.message,
          rate: neg.rate,
          timestamp: new Date().toISOString(),
          negotiationType: neg.negotiationType,
          sender: neg.sender
        };

        socket.emit('internal_negotiation_update', data);
      }, index * 1500); // 1.5 second delay between each
    });

    addTestResult('✅ Multiple negotiations queued (from different users)', true);
  };

  const testInhouseNegotiation = () => {
    if (!socket) {
      addTestResult('❌ Socket not connected', false);
      return;
    }

    // Simulate message FROM SALES TEAM (not current user if user is shipper)
    const inhouseData = {
      bidId: 'bid_' + Date.now(),
      loadId: 'load_' + Date.now(),
      senderId: 'sales_team_' + Math.floor(Math.random() * 100), // Different from current user
      senderName: 'Sales Manager',
      inhouseName: 'Sales Manager',
      inhouseMessage: 'We can approve $2,950 for this route. This is our final offer.',
      inhouseCounterRate: 2950,
      message: 'Sales team has approved a counter offer',
      rate: 2950,
      timestamp: new Date().toISOString(),
      negotiationType: 'inhouse_approval',
      sender: 'inhouse' // Explicitly set as inhouse
    };

    socket.emit('inhouse_internal_negotiate', inhouseData);
    addTestResult('✅ Inhouse negotiation event sent (from sales team)', true, inhouseData);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800">Real API Tester</h3>
        <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        Test real internal-negotiation-thread API events and socket integration.
      </div>

      <div className="space-y-2 mb-3">
        <button
          onClick={testRealNegotiationAPI}
          disabled={loading}
          className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '🔥 Test Real API Call'}
        </button>
        
        <button
          onClick={testSocketNegotiationEvent}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          💰 Test Live Negotiation
        </button>
        
        <button
          onClick={testInhouseNegotiation}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🏢 Test Inhouse Event
        </button>
        
        <button
          onClick={testMultipleNegotiations}
          className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🎭 Test Multiple (Demo)
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs font-semibold mb-1 text-gray-700">Test Results:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {testResults.map(result => (
              <div key={result.id} className={`text-xs p-2 rounded ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <div className="font-medium">{result.message}</div>
                <div className="text-gray-500 text-xs">{result.timestamp}</div>
                {result.data && (
                  <div className="text-xs text-gray-600 mt-1 font-mono">
                    Rate: ${result.data.rate || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Socket: {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        <div className="text-xs text-gray-400">
          API: {BASE_API_URL.includes('render') ? '🌐 Live' : '🏠 Local'}
        </div>
      </div>
    </div>
  );
};

export default RealApiTester;