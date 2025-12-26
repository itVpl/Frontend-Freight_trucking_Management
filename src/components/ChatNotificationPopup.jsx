import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatNotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    const handleChatMessage = (data) => {
      console.log('💬 New chat message received:', data);
      
      if (data.senderId === user._id || data.senderId === user.userId) {
        return;
      }

      const notification = {
        id: Date.now(),
        type: 'chat_message',
        senderId: data.senderId,
        senderName: data.senderName || data.sender?.name || data.sender?.compName || 'Unknown User',
        senderCompany: data.sender?.compName || data.senderCompany || null,
        senderAvatar: data.sender?.profileImage || data.senderAvatar || null,
        message: data.message || data.content,
        loadId: data.loadId || data.load?.loadId || null,
        loadDetails: data.load || data.loadDetails || null,
        origin: data.load?.origin || data.origin || null,
        destination: data.load?.destination || data.destination || null,
        timestamp: new Date(),
        conversationId: data.conversationId || data.chatId || null,
        isRead: false
      };

      setNotifications(prev => {
        const filtered = prev.filter(n => n.senderId !== data.senderId);
        return [notification, ...filtered].slice(0, 5);
      });

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);

      if ('Notification' in window && Notification.permission === 'granted') {
        const title = `💬 ${notification.senderName}`;
        const body = notification.loadId 
          ? `Load ${notification.loadId}: ${notification.message}`
          : notification.message;
        
        const browserNotif = new Notification(title, {
          body: body.length > 100 ? body.substring(0, 100) + '...' : body,
          icon: '/public/images/logo_vpower.png',
          tag: `chat-${data.senderId}`,
          data: { senderId: data.senderId, type: 'chat' }
        });

        browserNotif.onclick = () => {
          window.focus();
          handleNotificationClick(notification);
          browserNotif.close();
        };

        setTimeout(() => browserNotif.close(), 8000);
      }

      playNotificationSound();
    };

    socket.on('new_message', handleChatMessage);
    socket.on('receive_message', handleChatMessage);
    socket.on('chat_message', handleChatMessage);
    socket.on('message', handleChatMessage);

    return () => {
      socket.off('new_message', handleChatMessage);
      socket.off('receive_message', handleChatMessage);
      socket.off('chat_message', handleChatMessage);
      socket.off('message', handleChatMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Chat notification permission:', permission);
      });
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.loadId) {
      if (user.userType === 'shipper' || user.type === 'shipper') {
        navigate(`/loadboard?loadId=${notification.loadId}`);
      } else {
        navigate(`/consignment?loadId=${notification.loadId}`);
      }
    } else {
      navigate('/email');
    }
    
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const dismissNotification = (id, event) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
      {notifications.length > 1 && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">
            {notifications.length} new messages
          </span>
          <button
            onClick={dismissAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Dismiss All
          </button>
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-slideIn max-w-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {notification.senderAvatar ? (
                  <img
                    src={notification.senderAvatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  notification.senderName.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {notification.senderName}
                </div>
                {notification.senderCompany && (
                  <div className="text-xs text-gray-500 truncate">
                    {notification.senderCompany}
                  </div>
                )}
                <div className="flex items-center space-x-1 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-500">New Message</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => dismissNotification(notification.id, e)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>

          {notification.loadId && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-800">Load Details</span>
                <span className="text-xs text-blue-600 font-mono">
                  {notification.loadId.slice(-8)}
                </span>
              </div>
              
              {(notification.origin || notification.destination) && (
                <div className="space-y-1">
                  {notification.origin && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 font-medium">From:</span>
                      <span className="text-xs text-gray-700 truncate">
                        {typeof notification.origin === 'string' 
                          ? notification.origin 
                          : `${notification.origin.city || ''}, ${notification.origin.state || ''}`
                        }
                      </span>
                    </div>
                  )}
                  {notification.destination && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-red-600 font-medium">To:</span>
                      <span className="text-xs text-gray-700 truncate">
                        {typeof notification.destination === 'string' 
                          ? notification.destination 
                          : `${notification.destination.city || ''}, ${notification.destination.state || ''}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              {notification.loadDetails && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {notification.loadDetails.weight && (
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <span className="ml-1 font-medium">{notification.loadDetails.weight} lbs</span>
                    </div>
                  )}
                  {notification.loadDetails.rate && (
                    <div>
                      <span className="text-gray-500">Rate:</span>
                      <span className="ml-1 font-medium text-green-600">
                        ${notification.loadDetails.rate.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <div className="text-sm text-gray-800 leading-relaxed break-words">
              {notification.message}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span>💬 Chat Message</span>
              {notification.loadId && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  Load Related
                </span>
              )}
            </div>
            <span>
              {notification.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs text-blue-600 font-medium">
              Click to {notification.loadId ? 'view load details' : 'open chat'}
            </span>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatNotificationPopup;