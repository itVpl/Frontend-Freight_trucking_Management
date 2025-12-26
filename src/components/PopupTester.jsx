import React, { useState, useEffect } from 'react';
import { useMessageNotifications } from '../context/MessageNotificationContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';

const PopupTester = () => {
  const { push } = useMessageNotifications();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [realLoads, setRealLoads] = useState([]);
  const [realBids, setRealBids] = useState([]);

  // Fetch real loads data
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const loads = response.data?.loads || response.data || [];
        setRealLoads(loads.slice(0, 3)); // Get first 3 loads
        
        // Try to get bids for first load
        if (loads.length > 0) {
          try {
            const bidsResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/load/${loads[0]._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setRealBids(bidsResponse.data?.bids || []);
          } catch (err) {
            console.log('No bids found for load');
          }
        }
      } catch (error) {
        console.error('Error fetching real data:', error);
      }
    };

    fetchRealData();
  }, []);

  const testRealNegotiationPopup = () => {
    const realLoad = realLoads[0];
    const realBid = realBids[0];
    
    if (!realLoad) {
      // Fallback to realistic dummy data if no real data
      push({
        id: `real-negotiation-${Date.now()}`,
        senderId: 'shipper-001',
        senderName: user?.name || 'Current Shipper',
        message: '💰 Counter offer: $3,200 for Chicago to Dallas route',
        avatarUrl: user?.avatar || null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 10000,
        negotiationData: {
          bidId: 'bid-' + Date.now(),
          rate: 3200,
          sender: 'shipper',
          loadId: 'load-' + Date.now()
        }
      });
      return;
    }

    // Use real load data
    const rate = realBid?.rate || realLoad.rate || Math.floor(Math.random() * 2000) + 2000;
    const origin = realLoad.origins?.[0] || realLoad;
    const destination = realLoad.destinations?.[0] || realLoad;
    
    const fromCity = origin.city || origin.fromCity || 'Origin City';
    const toCity = destination.city || destination.toCity || 'Destination City';
    
    push({
      id: `real-negotiation-${Date.now()}`,
      senderId: user?._id || 'current-user',
      senderName: user?.name || user?.email || 'Shipper',
      message: `💰 New rate: $${rate.toLocaleString()} for ${fromCity} to ${toCity}`,
      avatarUrl: user?.avatar || null,
      conversationPath: '/loadboard',
      receivedAt: Date.now(),
      ttlMs: 10000,
      negotiationData: {
        bidId: realBid?._id || 'bid-' + Date.now(),
        loadId: realLoad._id,
        rate: rate,
        sender: 'shipper',
        route: `${fromCity} → ${toCity}`
      }
    });
  };

  const testRealBidPopup = () => {
    const realLoad = realLoads[0];
    const realBid = realBids[0];
    
    if (!realLoad) {
      // Fallback to realistic dummy data
      push({
        id: `real-bid-${Date.now()}`,
        senderId: 'driver-001',
        senderName: 'John Smith (Driver)',
        message: '🎯 New Bid: $2,800 - Available immediately',
        avatarUrl: null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 8000
      });
      return;
    }

    // Use real data
    const rate = realBid?.rate || Math.floor(Math.random() * 1500) + 2000;
    const driverName = realBid?.driverName || realBid?.truckerName || 'Driver';
    const origin = realLoad.origins?.[0] || realLoad;
    const destination = realLoad.destinations?.[0] || realLoad;
    
    const fromCity = origin.city || origin.fromCity || 'Origin';
    const toCity = destination.city || destination.toCity || 'Destination';
    
    push({
      id: `real-bid-${Date.now()}`,
      senderId: realBid?.driverId || 'driver-' + Date.now(),
      senderName: `${driverName} (Driver)`,
      message: `🎯 New Bid: $${rate.toLocaleString()} for ${fromCity} → ${toCity}`,
      avatarUrl: realBid?.driverAvatar || null,
      conversationPath: '/loadboard',
      receivedAt: Date.now(),
      ttlMs: 8000
    });
  };

  const testRealChatPopup = () => {
    const realLoad = realLoads[0];
    
    const messages = [
      'Can we discuss the pickup time?',
      'Is the delivery address confirmed?',
      'What about the loading dock requirements?',
      'Do you need any special equipment?',
      'Can we schedule a call to discuss details?'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const loadInfo = realLoad ? ` (Load #${realLoad.shipmentNumber || realLoad._id?.slice(-6)})` : '';
    
    push({
      id: `real-chat-${Date.now()}`,
      senderId: 'sales-team-001',
      senderName: 'Sales Team',
      message: `💬 ${randomMessage}${loadInfo}`,
      avatarUrl: null,
      conversationPath: realLoad ? `/loadboard?loadId=${realLoad._id}` : '/loadboard',
      receivedAt: Date.now(),
      ttlMs: 8000
    });
  };

  const simulateSocketEvent = () => {
    if (!socket) {
      alert('Socket not connected!');
      return;
    }

    const realLoad = realLoads[0];
    
    // Simulate a real socket event
    const socketData = {
      bidId: 'bid-' + Date.now(),
      loadId: realLoad?._id || 'load-' + Date.now(),
      senderId: 'driver-' + Math.floor(Math.random() * 1000),
      senderName: 'Mike Johnson',
      message: 'I can do this load for $2,650',
      rate: 2650,
      sender: 'trucker',
      timestamp: new Date().toISOString()
    };

    console.log('🔥 Simulating socket event:', socketData);
    
    // Emit the event that your UniversalSocketListener is listening for
    socket.emit('test_negotiation_message', socketData);
    
    // Also trigger it directly to see immediate result
    setTimeout(() => {
      push({
        id: `socket-sim-${Date.now()}`,
        senderId: socketData.senderId,
        senderName: socketData.senderName,
        message: `💰 Socket Event: ${socketData.message}`,
        avatarUrl: null,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 10000,
        negotiationData: socketData
      });
    }, 500);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white p-4 rounded-lg shadow-lg border max-w-xs">
      <h3 className="font-bold mb-2 text-sm">Real Data Popup Tester</h3>
      <div className="text-xs text-gray-600 mb-3">
        Loads: {realLoads.length} | Bids: {realBids.length}
      </div>
      <div className="space-y-2">
        <button
          onClick={testRealNegotiationPopup}
          className="block w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
        >
          Real Negotiation Popup
        </button>
        <button
          onClick={testRealBidPopup}
          className="block w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
        >
          Real Bid Popup
        </button>
        <button
          onClick={testRealChatPopup}
          className="block w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
        >
          Real Chat Popup
        </button>
        <button
          onClick={simulateSocketEvent}
          className="block w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
        >
          Simulate Socket Event
        </button>
      </div>
    </div>
  );
};

export default PopupTester;