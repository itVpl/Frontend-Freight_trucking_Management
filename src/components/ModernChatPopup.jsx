import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModernChatPopup = () => {
  const [messages, setMessages] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    const handleChatMessage = (data) => {
      console.log('💬 New chat message received:', data);
      
      // Skip own messages
      if (data.senderId === user._id || data.senderId === user.userId) {
        return;
      }

      const message = {
        id: Date.now() + Math.random(),
        senderId: data.senderId,
        senderName: data.senderName || data.sender?.name || 'Unknown User',
        message: data.message || data.content,
        timestamp: new Date(),
        loadId: data.loadId,
        avatar: data.avatar || data.sender?.avatar,
        type: data.type || 'chat',
        isOnline: true
      };

      setMessages(prev => {
        const filtered = prev.filter(m => m.senderId !== data.senderId);
        return [message, ...filtered].slice(0, 5);
      });

      // Auto remove after 8 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      }, 8000);

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`💬 ${message.senderName}`, {
          body: message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message,
          icon: '/public/images/logo_vpower.png',
          tag: `chat-${data.senderId}`,
          data: { loadId: data.loadId, senderId: data.senderId }
        });

        notification.onclick = () => {
          window.focus();
          handleMessageClick(message);
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      }

      // Play notification sound
      playNotificationSound();
    };

    // Listen for various chat events
    socket.on('new_message', handleChatMessage);
    socket.on('receive_message', handleChatMessage);
    socket.on('chat_message', handleChatMessage);
    socket.on('message_received', handleChatMessage);

    return () => {
      socket.off('new_message', handleChatMessage);
      socket.off('receive_message', handleChatMessage);
      socket.off('chat_message', handleChatMessage);
      socket.off('message_received', handleChatMessage);
    };
  }, [socket, user]);

  const playNotificationSound = () => {
    try {
      // Create a pleasant notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a more pleasant sound sequence
      const frequencies = [800, 600, 400];
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleMessageClick = (message) => {
    if (message.loadId) {
      navigate(`/loadboard?loadId=${message.loadId}`);
    } else {
      navigate('/loadboard');
    }
    
    // Remove the clicked message
    setMessages(prev => prev.filter(m => m.id !== message.id));
  };

  const dismissMessage = (id, event) => {
    event.stopPropagation();
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const dismissAll = () => {
    setMessages([]);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop blur effect */}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-black/5 to-transparent backdrop-blur-[1px]"></div>
      </div>

      {/* Messages container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
        {/* Header with dismiss all */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {messages.length} new messages
              </span>
            </div>
            <button
              onClick={dismissAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Message cards */}
        {messages.map((message, index) => (
          <div
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`
              group relative bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 
              cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 
              transform animate-slide-in-right overflow-hidden
              ${index === 0 ? 'ring-2 ring-blue-500/20' : ''}
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {message.senderName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Online indicator */}
                    {message.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    )}
                  </div>

                  {/* Name and time */}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {message.senderName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>💬</span>
                      <span>{getTimeAgo(message.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => dismissMessage(message.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message content */}
              <div className="mb-3">
                <p className="text-gray-800 text-sm leading-relaxed break-words">
                  {message.message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-gray-500">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Chat Message</span>
                </div>
                
                {message.loadId && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Load #{message.loadId.slice(-6)}
                  </div>
                )}
              </div>

              {/* Action hint */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-xs text-gray-400 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Click to view conversation</span>
                </div>
              </div>
            </div>

            {/* Pulse animation for new messages */}
            {index === 0 && (
              <div className="absolute inset-0 rounded-xl border-2 border-blue-500 animate-pulse opacity-50"></div>
            )}
          </div>
        ))}
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
};

export default ModernChatPopup;