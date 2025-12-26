import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const NegotiationChatPopup = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    const handleNegotiationMessage = (data) => {
      console.log('🔔 New negotiation message received:', data);
      
      if (data.senderId === user._id || data.senderId === user.userId) {
        return;
      }

      const notification = {
        id: Date.now(),
        bidId: data.bidId,
        loadId: data.loadId,
        sender: data.senderName || (data.sender === 'shipper' ? 'Shipper' : 'Sales Team'),
        message: data.message || `New rate: $${data.rate?.toLocaleString()}`,
        rate: data.rate,
        timestamp: new Date(),
        isShipper: data.sender === 'shipper',
        type: 'negotiation',
        avatar: data.senderAvatar || null
      };

      setNotifications(prev => {
        const filtered = prev.filter(n => n.bidId !== data.bidId);
        return [notification, ...filtered].slice(0, 5);
      });

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 8000);

      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotif = new Notification('💬 New Negotiation Message', {
          body: `${notification.sender}: ${notification.message}`,
          icon: '/public/images/logo_vpower.png',
          tag: `negotiation-${data.bidId}`,
          data: { bidId: data.bidId, type: 'negotiation' }
        });

        browserNotif.onclick = () => {
          window.focus();
          handleNotificationClick(notification);
          browserNotif.close();
        };

        setTimeout(() => browserNotif.close(), 6000);
      }

      playNotificationSound();
    };

    socket.on('new_negotiation_message', handleNegotiationMessage);
    socket.on('bid_negotiation_update', handleNegotiationMessage);
    socket.on('negotiation_message', handleNegotiationMessage);

    return () => {
      socket.off('new_negotiation_message', handleNegotiationMessage);
      socket.off('bid_negotiation_update', handleNegotiationMessage);
      socket.off('negotiation_message', handleNegotiationMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
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
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (user.userType === 'shipper' || user.type === 'shipper') {
      navigate('/loadboard');
    } else {
      navigate('/bid-management');
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
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
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
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-slideIn"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  notification.sender.charAt(0).toUpperCase()
                )}
              </div>
              
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {notification.sender}
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    notification.isShipper ? 'bg-green-500' : 'bg-blue-500'
                  }`}></span>
                  <span className="text-xs text-gray-500">
                    {notification.isShipper ? 'Shipper' : 'Sales Team'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => dismissNotification(notification.id, e)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="mb-2">
            <p className="text-gray-800 text-sm leading-relaxed">
              {notification.message}
            </p>
            
            {notification.rate && (
              <div className="mt-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                Rate: ${notification.rate.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              💬 Negotiation Message
            </span>
            <span>
              {notification.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {notification.bidId && (
            <div className="mt-1 text-xs text-gray-400">
              Bid: {notification.bidId.slice(-8)}
            </div>
          )}
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
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NegotiationChatPopup;