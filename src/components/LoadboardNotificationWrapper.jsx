import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import NotificationAlert from './NotificationAlert';

const LoadboardNotificationWrapper = ({ children }) => {
  const { socket } = useSocket();
  
  // State for the alert only
  const [alertData, setAlertData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewNegotiationMessage = (data) => {
      console.log('🔔 New negotiation message received:', data);
      
      // Show alert below notification bell with broker name
      setAlertData({
        message: data.message,
        sender: data.sender || data.senderName || 'Broker'
      });
      setShowAlert(true);
    };

    const handleNewChatMessage = (data) => {
      console.log('🔔 New chat message received:', data);
      
      // Show alert below notification bell for chat messages with broker name
      setAlertData({
        message: data.message || data.text || data.content,
        sender: data.sender || data.senderName || data.from || 'User'
      });
      setShowAlert(true);
    };

    const handleGenericMessage = (data) => {
      console.log('🔔 Generic message received:', data);
      
      // Show alert for any generic message with broker name
      setAlertData({
        message: data.message || data.text || data.content || 'New message received',
        sender: data.sender || data.senderName || data.from || 'System'
      });
      setShowAlert(true);
    };

    // Listen to multiple message events
    socket.on('new_negotiation_message', handleNewNegotiationMessage);
    socket.on('new_chat_message', handleNewChatMessage);
    socket.on('new_message', handleGenericMessage);
    socket.on('receive_message', handleGenericMessage);
    socket.on('chat_message', handleGenericMessage);
    socket.on('message', handleGenericMessage);

    return () => {
      socket.off('new_negotiation_message', handleNewNegotiationMessage);
      socket.off('new_chat_message', handleNewChatMessage);
      socket.off('new_message', handleGenericMessage);
      socket.off('receive_message', handleGenericMessage);
      socket.off('chat_message', handleGenericMessage);
      socket.off('message', handleGenericMessage);
    };
  }, [socket]);

  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertData(null);
  };

  return (
    <>
      {children}
      
      {/* Simple Alert Component Below Notification Bell - Shows Broker Name */}
      {showAlert && alertData && (
        <NotificationAlert
          message={alertData.message}
          sender={alertData.sender}
          onClose={handleCloseAlert}
          autoHide={true}
          duration={5000}
        />
      )}
    </>
  );
};

export default LoadboardNotificationWrapper;