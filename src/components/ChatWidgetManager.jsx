// components/ChatWidgetManager.jsx
import React, { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';
import { useSocket } from '../context/SocketContext';

const ChatWidgetManager = () => {
  const [activeChats, setActiveChats] = useState([]);
  const { connected } = useSocket();

  useEffect(() => {
    // Listen for open-chat-window events
    const handleOpenChat = (event) => {
      const { receiverId, receiverName, loadId } = event.detail;
      
      // Check if chat already open
      const existingChat = activeChats.find(chat => chat.receiverId === receiverId);
      if (!existingChat) {
        setActiveChats(prev => [...prev, {
          id: Date.now(),
          receiverId,
          receiverName: receiverName || `User ${receiverId?.substring(0, 8) || 'Unknown'}`,
          loadId
        }]);
      }
    };

    window.addEventListener('open-chat-window', handleOpenChat);

    return () => {
      window.removeEventListener('open-chat-window', handleOpenChat);
    };
  }, [activeChats]);

  const closeChat = (chatId) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  if (activeChats.length === 0 || !connected) return null;

  return (
    <>
      {activeChats.map((chat, index) => (
        <div 
          key={chat.id}
          style={{
            right: `${20 + (index * 420)}px`,
            bottom: '20px'
          }}
          className="fixed z-[10000]"
        >
          <ChatWidget
            receiverId={chat.receiverId}
            receiverName={chat.receiverName}
            loadId={chat.loadId}
            onClose={() => closeChat(chat.id)}
          />
        </div>
      ))}
    </>
  );
};

export default ChatWidgetManager;