import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNegotiation } from '../context/NegotiationContext';
import { useAuth } from '../context/AuthContext';

const SocketNotificationHandler = () => {
  const { socket } = useSocket();
  const { addNotification } = useNegotiation();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // data: { sender, content, negotiationData, senderId }
      // Prevent self-notifications
      if (user && data.senderId === user._id) return;

      let messageContent = data.content;
      let senderName = data.sender;
      let senderAvatar = null;

      // Try to extract better details from negotiationData if available (for handleNewMessage)
      if (data.negotiationData && data.negotiationData.internalNegotiation && Array.isArray(data.negotiationData.internalNegotiation)) {
          const history = data.negotiationData.internalNegotiation;
          if (history.length > 0) {
              const lastMsg = history[history.length - 1];
              messageContent = lastMsg.message || messageContent;
              senderName = lastMsg.sender?.name || lastMsg.senderName || lastMsg.sender?.username || senderName;
              senderAvatar = lastMsg.sender?.profileImage || lastMsg.sender?.avatar;
          }
      }

      addNotification({
        sender: senderName || 'System',
        content: messageContent,
        timestamp: new Date().toISOString(),
        avatarUrl: senderAvatar,
        negotiationData: data.negotiationData
      });
    };

    const handleNegotiationUpdate = (data) => {
      // Listen for negotiation updates which may contain notification messages
      // data contains: bidId, message, internalNegotiation, etc.
      
      let messageContent = null;
      let senderName = null;
      let senderId = null;
      let senderAvatar = null;
      let type = data.type;

      // 1. Try to extract from the latest history item (Most accurate for chat)
      let history = data.internalNegotiation;
      if (!Array.isArray(history) && history && history.history && Array.isArray(history.history)) {
          history = history.history;
      }

      if (history && Array.isArray(history) && history.length > 0) {
          const lastMsg = history[history.length - 1];
          messageContent = lastMsg.message;
          // Handles populated sender object or direct fields
          senderName = lastMsg.sender?.name || lastMsg.senderName || lastMsg.sender?.username;
          senderId = lastMsg.sender?._id || lastMsg.senderId;
          senderAvatar = lastMsg.sender?.profileImage || lastMsg.sender?.avatar;
      }

      // 2. If history didn't give us content, check top-level data (Fallback)
      if (!messageContent) {
          messageContent = data.message;
          senderName = data.senderName;
          senderId = data.senderId;
      }

      if (messageContent) {
        // Filter out own messages
        if (user && senderId && user._id === senderId) return;

        // Fallback filter by type if ID comparison wasn't possible
        if (type && !senderId) {
            const isShipperMsg = type === 'shipper_negotiation';
            if (user?.role === 'shipper' && isShipperMsg) return;
            if (user?.role === 'trucker' && !isShipperMsg) return;
        }

        // Determine final display name
        let displayName = senderName;
        if (!displayName) {
             if (type === 'shipper_negotiation') displayName = 'Shipper';
             else if (type === 'trucker_negotiation') displayName = data.driverName || data.senderName;
             else displayName = 'System';
        }

        addNotification({
            sender: displayName,
            content: messageContent,
            timestamp: new Date().toISOString(),
            avatarUrl: senderAvatar,
            negotiationData: data // Contains bidId
        });
      }
    };

    socket.on('negotiation_message', handleNewMessage);
    socket.on('bid_negotiation_update', handleNegotiationUpdate);
    
    // Add handler for direct bid updates (status changes)
    const handleBidUpdate = (data) => {
      // Prevent self-notifications
      if (user) {
          const currentUserId = user._id || user.userId;
          const senderId = data.senderId;
          if (currentUserId && senderId && String(currentUserId) === String(senderId)) return;
      }

      let title = 'Bid Update';
      let message = data.message || 'Bid status updated';
      
      if (data.status === 'PendingApproval') {
        title = 'New Bid Received';
        message = data.message || `New bid placed by ${data.driverName || 'Driver'}`;
      } else if (data.status === 'Accepted') {
        title = 'Bid Accepted';
        message = `Your bid has been accepted`;
      } else if (data.status === 'Rejected') {
        title = 'Bid Rejected';
        message = `Your bid has been rejected`;
      }

      addNotification({
        sender: title,
        content: message,
        timestamp: new Date().toISOString(),
        negotiationData: data // Contains bidId
      });
    };
    
    socket.on('bid_update', handleBidUpdate);

    return () => {
      socket.off('negotiation_message', handleNewMessage);
      socket.off('bid_negotiation_update', handleNegotiationUpdate);
      socket.off('bid_update', handleBidUpdate);
    };
  }, [socket, addNotification, user]);

  return null;
};

export default SocketNotificationHandler;
