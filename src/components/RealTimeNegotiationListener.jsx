import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';

const RealTimeNegotiationListener = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    console.log('🔥 RealTimeNegotiationListener: Setting up for internal-negotiation-thread API events');

    // Listen for real-time negotiation events from your backend
    const handleInternalNegotiationUpdate = (data) => {
      console.log('💰 Real internal negotiation update received:', data);
      console.log('🔍 Current user info:', { 
        id: user._id || user.userId || user.empId, 
        name: user.name || user.email, 
        type: user.userType || user.type 
      });
      
      // STRICT FILTERING: Skip if message is from current user
      const currentUserId = user._id || user.userId || user.empId;
      const currentUserName = user.name || user.email;
      const currentUserType = user.userType || user.type;
      
      const senderId = data.senderId || data.userId || data.from || data.sender?.id;
      const senderName = data.senderName || data.userName || data.name;
      const senderType = data.sender || data.senderType;
      
      console.log('🔍 Message sender info:', { 
        senderId, 
        senderName, 
        senderType,
        isOwnMessage: data.isOwnMessage 
      });
      
      // MULTIPLE STRICT CHECKS to ensure we don't show our own messages
      const isOwnMessage = (
        // Direct ID match
        senderId === currentUserId ||
        // Name match
        senderName === currentUserName ||
        // Explicit own message flag
        data.isOwnMessage === true ||
        // If current user is shipper and message is from shipper with same ID/name
        ((currentUserType === 'shipper') && 
         (senderType === 'shipper' || data.negotiationType === 'shipper_counter') &&
         (senderId === currentUserId || senderName === currentUserName)) ||
        // If current user is inhouse/sales and message is from inhouse with same ID/name
        ((currentUserType === 'inhouse' || currentUserType === 'sales') && 
         (senderType === 'inhouse' || data.negotiationType === 'inhouse_counter') &&
         (senderId === currentUserId || senderName === currentUserName))
      );
      
      if (isOwnMessage) {
        console.log('⏭️ SKIPPING: This is YOUR OWN message - no popup needed');
        console.log('⏭️ Reason: senderId match or name match or type match');
        return;
      }

      console.log('✅ This is a RECEIVED message from SOMEONE ELSE - showing popup');

      // Create notification from real API data
      const notification = {
        id: `negotiation-${Date.now()}-${Math.random()}`,
        type: 'negotiation',
        senderId: senderId,
        senderName: senderName || getDefaultSenderName(data),
        message: data.message || data.content || `New rate: $${data.rate?.toLocaleString()}`,
        timestamp: new Date(data.timestamp || data.createdAt || Date.now()),
        bidId: data.bidId,
        loadId: data.loadId,
        rate: data.rate || data.newRate || data.counterRate,
        previousRate: data.previousRate || data.oldRate,
        negotiationId: data.negotiationId || data._id,
        threadId: data.threadId,
        avatar: data.avatar || data.senderAvatar,
        isRead: false,
        priority: 'high',
        isReceived: true // Mark as received message
      };

      // Add to notifications
      setNotifications(prev => {
        // Remove old notifications from same negotiation thread
        const filtered = prev.filter(n => 
          n.threadId !== data.threadId && n.bidId !== data.bidId
        );
        return [notification, ...filtered].slice(0, 5);
      });

      // Auto remove after 12 seconds (high priority)
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 12000);

      // Show browser notification
      showBrowserNotification(notification);
      
      // Play notification sound
      playNegotiationSound();

      // Log for debugging
      console.log('📤 Showing RECEIVED negotiation popup:', notification);
    };

    // Helper function to get default sender name based on negotiation type
    const getDefaultSenderName = (data) => {
      if (data.negotiationType === 'driver_counter' || data.sender === 'trucker') {
        return data.driverName || 'Driver';
      }
      if (data.negotiationType === 'inhouse_counter' || data.sender === 'inhouse') {
        return 'Sales Team';
      }
      if (data.negotiationType === 'shipper_counter' || data.sender === 'shipper') {
        return 'Shipper';
      }
      return 'Negotiation Team';
    };

    // Listen for bid negotiation updates (from your backend)
    const handleBidNegotiationUpdate = (data) => {
      console.log('🎯 Real bid negotiation update:', data);
      handleInternalNegotiationUpdate(data);
    };

    // Listen for shipper internal negotiate events
    const handleShipperInternalNegotiate = (data) => {
      console.log('🚢 Shipper internal negotiate:', data);
      
      // If current user is shipper, don't show popup for their own messages
      if ((user.userType === 'shipper' || user.type === 'shipper') && 
          (data.senderId === user._id || data.senderId === user.userId)) {
        console.log('⏭️ Skipping own shipper message');
        return;
      }
      
      handleInternalNegotiationUpdate({
        ...data,
        senderName: data.shipperName || data.senderName || 'Shipper',
        message: data.shipperMessage || data.message || `Shipper counter: $${data.shipperCounterRate?.toLocaleString()}`,
        rate: data.shipperCounterRate || data.rate,
        negotiationType: 'shipper_counter'
      });
    };

    // Listen for inhouse internal negotiate events
    const handleInhouseInternalNegotiate = (data) => {
      console.log('🏢 Inhouse internal negotiate:', data);
      
      // If current user is inhouse/sales, don't show popup for their own messages
      if ((user.userType === 'inhouse' || user.type === 'inhouse' || user.role === 'sales') && 
          (data.senderId === user._id || data.senderId === user.userId)) {
        console.log('⏭️ Skipping own inhouse message');
        return;
      }
      
      handleInternalNegotiationUpdate({
        ...data,
        senderName: data.inhouseName || data.senderName || 'Sales Team',
        message: data.inhouseMessage || data.message || `Sales team response: $${data.inhouseCounterRate?.toLocaleString()}`,
        rate: data.inhouseCounterRate || data.rate,
        negotiationType: 'inhouse_counter'
      });
    };

    // Register all negotiation event listeners
    const negotiationEvents = {
      // Main negotiation events
      'internal_negotiation_update': handleInternalNegotiationUpdate,
      'negotiation_thread_update': handleInternalNegotiationUpdate,
      'bid_negotiation_update': handleBidNegotiationUpdate,
      
      // Specific negotiation types
      'shipper_internal_negotiate': handleShipperInternalNegotiate,
      'inhouse_internal_negotiate': handleInhouseInternalNegotiate,
      
      // Alternative event names your backend might use
      'new_negotiation_message': handleInternalNegotiationUpdate,
      'negotiation_message_received': handleInternalNegotiationUpdate,
      'internal_negotiation_message': handleInternalNegotiationUpdate,
      
      // Real-time API events
      'api_negotiation_update': handleInternalNegotiationUpdate,
      'live_negotiation_update': handleInternalNegotiationUpdate
    };

    // Register all listeners
    Object.entries(negotiationEvents).forEach(([event, handler]) => {
      socket.on(event, handler);
      console.log(`✅ Registered real-time listener for: ${event}`);
    });

    // Also set up periodic polling for missed events (backup)
    const pollForUpdates = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Poll for recent negotiation updates
        const response = await axios.get(`${BASE_API_URL}/api/v1/negotiation/recent`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            since: new Date(Date.now() - 30000).toISOString(), // Last 30 seconds
            userId: user._id || user.userId 
          }
        });

        if (response.data?.negotiations?.length > 0) {
          response.data.negotiations.forEach(negotiation => {
            // Only show if not already shown
            const alreadyShown = notifications.some(n => 
              n.negotiationId === negotiation._id || 
              n.threadId === negotiation.threadId
            );
            
            if (!alreadyShown) {
              handleInternalNegotiationUpdate(negotiation);
            }
          });
        }
      } catch (error) {
        // Silently handle polling errors
        console.log('Negotiation polling error (normal):', error.message);
      }
    };

    // Poll every 10 seconds as backup
    const pollInterval = setInterval(pollForUpdates, 10000);

    // Cleanup
    return () => {
      Object.entries(negotiationEvents).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      clearInterval(pollInterval);
      console.log('🧹 Cleaned up RealTimeNegotiationListener');
    };
  }, [socket, user, notifications]);

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification('💰 Negotiation Update', {
        body: `${notification.senderName}: ${notification.message}`,
        icon: '/public/images/logo_vpower.png',
        tag: `negotiation-${notification.bidId}`,
        data: { 
          bidId: notification.bidId,
          loadId: notification.loadId,
          negotiationId: notification.negotiationId
        }
      });

      browserNotif.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
        browserNotif.close();
      };

      setTimeout(() => browserNotif.close(), 8000);
    }
  };

  const playNegotiationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Special sound for negotiation (higher pitch, more urgent)
      const frequencies = [1000, 1200, 1000, 800];
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate to loadboard with specific bid/load
    if (notification.bidId) {
      navigate(`/loadboard?bidId=${notification.bidId}`);
    } else if (notification.loadId) {
      navigate(`/loadboard?loadId=${notification.loadId}`);
    } else {
      navigate('/loadboard');
    }
    
    // Remove the clicked notification
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const dismissNotification = (id, event) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {/* Header for multiple notifications */}
      {notifications.length > 1 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-4 py-2 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {notifications.length} live negotiations
            </span>
          </div>
          <button
            onClick={dismissAll}
            className="text-xs text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/20"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Negotiation notifications */}
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`
            group relative cursor-pointer transform transition-all duration-300 
            hover:scale-[1.02] hover:shadow-2xl animate-slide-in-right
            bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100
            rounded-xl border-2 border-green-200 hover:border-green-300 backdrop-blur-sm overflow-hidden
            ring-2 ring-green-500/20 hover:ring-green-500/40
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Urgent indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-pulse"></div>

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Negotiation icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                  💰
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-green-900 text-sm">
                      Live Negotiation
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-xs text-green-700">
                    {notification.senderName} • {getTimeAgo(notification.timestamp)}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={(e) => dismissNotification(notification.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400 hover:text-green-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message */}
            <div className="mb-3">
              <p className="text-green-900 text-sm leading-relaxed font-medium">
                {notification.message}
              </p>
            </div>

            {/* Rate comparison */}
            {notification.rate && (
              <div className="mb-3 flex items-center space-x-2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ${notification.rate.toLocaleString()}
                </span>
                {notification.previousRate && (
                  <>
                    <span className="text-green-600 text-xs">from</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs line-through">
                      ${notification.previousRate.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.bidId && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Bid #{notification.bidId.slice(-6)}
                  </span>
                )}
                {notification.loadId && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    Load #{notification.loadId.slice(-6)}
                  </span>
                )}
              </div>
              
              <div className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <span>Click to respond</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></div>
        </div>
      ))}

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
          animation: slide-in-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default RealTimeNegotiationListener;