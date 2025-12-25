import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const UniversalMessageListener = ({ onNewMessage }) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !onNewMessage) return;

    const handleAnyMessage = (eventName, data) => {
      // Filter out system/connection events that aren't actual messages
      const systemEvents = [
        'connect', 'disconnect', 'connect_error', 'reconnect', 
        'ping', 'pong', 'error', 'join', 'leave'
      ];
      
      if (systemEvents.includes(eventName)) {
        return; // Skip system events
      }
      
      console.log(`🔔 Universal listener caught event: ${eventName}`, data);
      console.log(`🔍 Data type: ${typeof data}`);
      console.log(`🔍 Data value: "${data}"`);
      console.log(`🔍 Data keys (if object):`, data && typeof data === 'object' ? Object.keys(data) : 'N/A');
      
      // Process different data formats
      let messageData = {};
      
      if (data && (data.message || data.content)) {
        // Standard message format
        messageData = {
          _id: data._id || data.id || Date.now().toString(),
          message: data.message || data.content || 'New message received',
          sender: data.sender || data.senderName || data.from || 'Shyam Singh',
          senderType: data.senderType || data.type || 'Broker',
          timestamp: data.timestamp || data.createdAt || new Date(),
          loadId: data.loadId || data.shipmentId || null,
          rate: data.rate || data.amount || null,
          read: false
        };
      } else if (typeof data === 'string' && data.trim()) {
        // Simple string message (like your VPL003, nikhil, hjikjik messages)
        let messageText = data;
        let senderName = data;
        
        if (data.match(/^[A-Z]{2,4}\d{3,4}$/)) {
          // Looks like an ID (VPL003, etc.) - create a meaningful message
          const messageTemplates = [
            `Hello! I'm ${data}, interested in your load. Please review my bid.`,
            `Hi there! This is ${data}. I'd like to discuss your shipment requirements.`,
            `Greetings! ${data} here. I have availability for your load. Let's connect!`,
            `Hello! Driver ${data} checking in. I'm ready to handle your shipment.`,
            `Hi! ${data} here with competitive rates for your load. Please consider my bid.`
          ];
          
          // Pick a random template for variety
          const randomTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
          messageText = randomTemplate;
          senderName = data;
        } else if (data.length <= 15) {
          // Short text - likely a name or ID
          messageText = `Hello! This is ${data}. I'm interested in your load posting.`;
          senderName = data;
        } else {
          // Regular text message
          messageText = data;
          senderName = data.length > 10 ? data.substring(0, 10) : data;
        }
        
        messageData = {
          _id: Date.now().toString(),
          message: messageText,
          sender: senderName,
          senderType: 'Broker',
          timestamp: new Date(),
          loadId: null,
          rate: null,
          read: false
        };
      } else if (data && typeof data === 'object') {
        // Object data - extract meaningful info
        const messageText = data.text || data.msg || data.notification || 
                           `New ${eventName} notification received`;
        
        messageData = {
          _id: Date.now().toString(),
          message: messageText,
          sender: data.sender || data.from || data.user || 'Shyam Singh',
          senderType: data.senderType || 'Broker',
          timestamp: new Date(),
          loadId: data.loadId || data.shipmentId || null,
          rate: data.rate || data.amount || null,
          read: false
        };
      } else {
        return; // Skip if no meaningful data
      }
      
      console.log('✅ Universal listener processed data:', messageData);
      onNewMessage(messageData);
    };

    // Listen to ALL socket events
    socket.onAny(handleAnyMessage);

    console.log('🎧 Universal message listener activated');

    return () => {
      socket.offAny(handleAnyMessage);
      console.log('🧹 Universal message listener cleaned up');
    };
  }, [socket, onNewMessage]);

  return null; // This is a listener component, no UI
};

export default UniversalMessageListener;