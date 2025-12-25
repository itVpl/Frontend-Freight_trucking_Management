import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useMessageNotifications } from '../context/MessageNotificationContext';
import { useAuth } from '../context/AuthContext';

const UniversalSocketListener = () => {
  const { socket } = useSocket();
  const messageNotifications = useMessageNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !messageNotifications?.push) {
      console.log('❌ UniversalSocketListener: Missing dependencies', { 
        socket: !!socket, 
        messageNotifications: !!messageNotifications?.push 
      });
      return;
    }

    console.log('🚀 UniversalSocketListener: Setting up real-time listeners for user:', user?.name || user?.email);
    console.log('📊 Socket status:', { connected: socket.connected, id: socket.id });

    // Enhanced handler for negotiation messages
    const handleNegotiationMessage = (data) => {
      console.log('💰 Real negotiation message received:', data);
      
      // Skip if message is from current user
      const currentUserId = user?._id || user?.userId || user?.empId;
      if (data.senderId === currentUserId) {
        console.log('⏭️ Skipping own negotiation message');
        return;
      }

      // Format message based on sender type
      let displayMessage = data.message || `New rate: ${data.rate?.toLocaleString()}`;
      let senderName = data.senderName || 'Unknown User';
      
      if (data.sender === 'shipper') {
        displayMessage = `💰 Shipper: ${displayMessage}`;
        senderName = data.senderName || 'Shipper';
      } else if (data.sender === 'inhouse') {
        displayMessage = `💰 Sales Team: ${displayMessage}`;
        senderName = data.senderName || 'Sales Team';
      } else if (data.sender === 'trucker') {
        displayMessage = `💰 ${data.senderName || data.driverName}: ${displayMessage}`;
        senderName = data.senderName || data.driverName;
      }

      const messageInfo = {
        id: `negotiation-${Date.now()}-${Math.random()}`,
        senderId: data.senderId || 'system',
        senderName: senderName,
        message: displayMessage,
        avatarUrl: data.senderAvatar || data.avatar,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 10000,
        negotiationData: data.negotiationData || data
      };

      console.log('📤 Showing real-time negotiation popup:', messageInfo);
      messageNotifications.push(messageInfo);
    };

    // Handler for bid updates (from placeBid, updateBidStatus, etc.)
    const handleBidUpdate = (data) => {
      console.log('🎯 Real bid update received:', data);
      
      // Skip if message is from current user
      if (data.senderId === user?._id || data.senderId === user?.userId) {
        console.log('⏭️ Skipping own bid update');
        return;
      }

      let displayMessage = data.message || `Bid update: ${data.rate?.toLocaleString()}`;
      
      // Format message based on bid status
      if (data.status === 'PendingApproval') {
        displayMessage = `🎯 New Bid: $${data.rate?.toLocaleString()}`;
      } else if (data.status === 'Accepted') {
        displayMessage = `✅ Bid Accepted: $${data.rate?.toLocaleString()}`;
      } else if (data.status === 'Rejected') {
        displayMessage = `❌ Bid Rejected: $${data.rate?.toLocaleString()}`;
      }

      const messageInfo = {
        id: `bid-${Date.now()}-${Math.random()}`,
        senderId: data.senderId || 'system',
        senderName: data.senderName || data.driverName || 'Driver',
        message: displayMessage,
        avatarUrl: data.avatar || data.driverAvatar,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 10000
      };

      console.log('📤 Showing real-time bid popup:', messageInfo);
      messageNotifications.push(messageInfo);
    };

    // Handler for chat messages (from your chat system)
    const handleChatMessage = (data) => {
      console.log('💬 Real chat message received:', data);
      
      // Skip if message is from current user
      if (data.senderId === user?._id || data.senderId === user?.userId) {
        console.log('⏭️ Skipping own chat message');
        return;
      }

      const messageInfo = {
        id: `chat-${Date.now()}-${Math.random()}`,
        senderId: data.senderId || 'system',
        senderName: data.senderName || data.sender?.name || 'Unknown User',
        message: `💬 ${data.message || data.content}`,
        avatarUrl: data.avatarUrl || data.sender?.avatar,
        conversationPath: data.loadId ? `/loadboard?loadId=${data.loadId}` : '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 8000
      };

      console.log('📤 Showing real-time chat popup:', messageInfo);
      messageNotifications.push(messageInfo);
    };

    // Handler for load updates
    const handleLoadUpdate = (data) => {
      console.log('🚛 Real load update received:', data);
      
      const messageInfo = {
        id: `load-${Date.now()}-${Math.random()}`,
        senderId: data.senderId || 'system',
        senderName: data.senderName || 'System',
        message: `🚛 Load Update: ${data.message || 'Status changed'}`,
        avatarUrl: data.avatarUrl,
        conversationPath: '/loadboard',
        receivedAt: Date.now(),
        ttlMs: 8000
      };

      console.log('📤 Showing real-time load popup:', messageInfo);
      messageNotifications.push(messageInfo);
    };

    // Register listeners for the EXACT events your backend emits
    const listeners = {
      // Negotiation events (from your backend controllers)
      'new_negotiation_message': handleNegotiationMessage,
      'bid_negotiation_update': handleNegotiationMessage,
      'negotiation_message': handleNegotiationMessage,
      
      // REAL INTERNAL NEGOTIATION EVENTS (for your API)
      'internal_negotiation_update': handleNegotiationMessage,
      'negotiation_thread_update': handleNegotiationMessage,
      'shipper_internal_negotiate': handleNegotiationMessage,
      'inhouse_internal_negotiate': handleNegotiationMessage,
      'api_negotiation_update': handleNegotiationMessage,
      'live_negotiation_update': handleNegotiationMessage,
      
      // Bid events (from your backend controllers)
      'new_bid': handleBidUpdate,
      'bid_update': handleBidUpdate,
      
      // Chat events (from your backend controllers)
      'new_message': handleChatMessage,
      'receive_message': handleChatMessage,
      'chat_message': handleChatMessage,
      
      // Load events
      'load_update': handleLoadUpdate,
      'load_assigned': handleLoadUpdate,
      'load_completed': handleLoadUpdate,
      
      // Test events (for testing purposes)
      'test_negotiation_message': handleNegotiationMessage,
      'test_bid_update': handleBidUpdate,
      'test_chat_message': handleChatMessage
    };

    // Register all listeners
    Object.entries(listeners).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
      console.log(`✅ Registered real-time listener for: ${eventName}`);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up UniversalSocketListener');
      Object.entries(listeners).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, [socket, messageNotifications, user]);

  return null; // This component doesn't render anything
};

export default UniversalSocketListener;