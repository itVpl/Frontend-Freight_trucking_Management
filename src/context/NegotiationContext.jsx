import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { Button, Box, Typography, Avatar } from '@mui/material';

const NegotiationContext = createContext();

export const useNegotiation = () => {
  return useContext(NegotiationContext);
};

export const NegotiationProvider = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [negotiationData, setNegotiationData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadBids, setUnreadBids] = useState(new Set()); // Track unread bids
  
  // Refs for polling to avoid dependency loops and redundant alerts
  const processedMessageIdsRef = useRef(new Set());
  const isPollingRef = useRef(false);
  const hasInitialPollCompletedRef = useRef(false);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const openNegotiation = (data) => {
    setNegotiationData(data);
    setIsOpen(true);
    // Clear unread status for this bid
    const bidId = data.bidId || data._id;
    if (bidId) {
        setUnreadBids(prev => {
            const newSet = new Set(prev);
            newSet.delete(bidId);
            return newSet;
        });
    }
  };

  const closeNegotiation = () => {
    setIsOpen(false);
    setNegotiationData(null);
  };

  const addNotification = (notification, options = {}) => {
    // Removed duplicate check here as polling handles it via processedMessageIdsRef
    // and we want to avoid stale closure issues with 'notifications' state.

    const newNotif = { 
      id: Date.now(), 
      timestamp: new Date().toISOString(), 
      read: false,
      ...notification 
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Mark bid as unread if not currently open
    // Moved outside of silent check to ensure initial load marks unread bids correctly
    if (notification.negotiationData) {
        const bidId = notification.negotiationData.bidId || notification.negotiationData._id;
        // Only mark unread if we are NOT currently viewing this negotiation
        if (bidId && (!isOpen || (negotiationData?.bidId !== bidId && negotiationData?._id !== bidId))) {
             setUnreadBids(prev => new Set(prev).add(bidId));
        }
    }

    // Show stacked popup unless silent
    if (!options.silent) {
        const ToastContent = () => (
            <div 
                onClick={() => notification.negotiationData && openNegotiation(notification.negotiationData)} 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
                <span style={{ fontWeight: 'bold' }}>{notification.sender}</span>
                <span style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {notification.content}
                </span>
            </div>
        );

        toast(<ToastContent />, {
            icon: notification.senderImage ? <Avatar src={notification.senderImage} sx={{ width: 24, height: 24 }} /> : '💬',
            onClick: () => notification.negotiationData && openNegotiation(notification.negotiationData)
        });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Helper to process history and add notifications
  const processHistory = (history, negotiationData, senderTypeFilter) => {
    // Get the last message
    if (!history || history.length === 0) return;
    
    history.forEach(msg => {
      const msgBy = (msg.by || '').toLowerCase();
      // Generate a unique ID for the message
      const msgId = msg._id || `${msg.at}-${msg.message.substring(0, 10)}`;
      
      // Determine if message is from the 'other' party
      let isIncoming = false;
      
      if (senderTypeFilter === 'shipper') {
           // User is Trucker, looking for Shipper messages
           if (msgBy.includes('shipper')) isIncoming = true;
      } else if (senderTypeFilter === 'trucker') {
           // User is Shipper, looking for Trucker messages
           // Also include 'inhouse', 'driver' as valid senders for Trucker side
           if (msgBy.includes('trucker') || msgBy.includes('driver') || msgBy.includes('inhouse')) isIncoming = true;
      }

      // If message is from the other party (senderTypeFilter) and not processed
      if (isIncoming && !processedMessageIdsRef.current.has(msgId)) {
        processedMessageIdsRef.current.add(msgId);
        
        // Add to notification list (silent if initial load)
        const loadId = negotiationData.loadId || negotiationData.load?.loadId || negotiationData.shipmentNumber;
        addNotification({
          sender: loadId ? `Load ID: ${loadId}` : (senderTypeFilter === 'shipper' 
            ? (negotiationData.shipper?.compName || 'Shipper')
            : (negotiationData.driver?.name || negotiationData.driver?.driverName)),
          senderImage: senderTypeFilter === 'shipper'
            ? negotiationData.shipper?.profileImage
            : negotiationData.driver?.profileImage,
          content: msg.message,
          timestamp: msg.at || new Date().toISOString(),
          negotiationData: negotiationData
        }, { silent: !hasInitialPollCompletedRef.current });
      } else {
          if (!processedMessageIdsRef.current.has(msgId)) {
              // First time seeing this old message or own message
              processedMessageIdsRef.current.add(msgId);
          }
      }
    });
  };

  const pollNegotiations = async () => {
    if (isPollingRef.current) return;
    if (!user) {
        console.log('NegotiationPolling: No user found');
        return;
    }
    isPollingRef.current = true;
    console.log('NegotiationPolling: Starting poll cycle for', user.type);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (user.type === 'trucker') {
        // Fetch accepted bids for Trucker
        const response = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('NegotiationPolling: Trucker accepted bids', response.data);

        if (response.data && Array.isArray(response.data.acceptedBids)) {
          const bids = response.data.acceptedBids;
          
          // For each bid, check negotiation thread
          for (const bid of bids) {
            try {
              const bidId = bid.bidId || bid._id;
              const threadResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (threadResponse.data.success && threadResponse.data.data?.internalNegotiation?.history) {
                const history = threadResponse.data.data.internalNegotiation.history;
                processHistory(history, bid, 'shipper');
              }
            } catch (err) {
              console.error('NegotiationPolling: Error fetching thread for bid', bid, err);
            }
          }
        }
      } else if (user.type === 'shipper') {
           // Shipper Logic: Poll active loads and their bids
           try {
             const loadsRes = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, { 
               headers: { Authorization: `Bearer ${token}` } 
             });
             
             let loads = [];
             if (loadsRes.data && Array.isArray(loadsRes.data.loads)) {
               loads = loadsRes.data.loads;
             } else if (Array.isArray(loadsRes.data)) {
               loads = loadsRes.data;
             }
             
             console.log('NegotiationPolling: Shipper loads found', loads.length);

             // Iterate ALL loads to be safe (temporarily removed filter for debugging)
             for (const load of loads) {
               try {
                 // Get bids for this load
                 const bidsRes = await axios.get(`${BASE_API_URL}/api/v1/bid/load/${load._id}`, {
                   headers: { Authorization: `Bearer ${token}` }
                 });

                 const bids = bidsRes.data.bids || [];
                 console.log(`NegotiationPolling: Bids for load ${load._id}`, bids.length);
                 
                 // Iterate bids
                 for (const bid of bids) {
                   try {
                      const bidId = bid._id;
                      const threadResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });

                      if (threadResponse.data.success && threadResponse.data.data?.internalNegotiation?.history) {
                        const history = threadResponse.data.data.internalNegotiation.history;
                        processHistory(history, bid, 'trucker'); // Trucker sends messages to Shipper
                      }
                   } catch (err) {
                     // Silent fail for individual bid
                   }
                 }
               } catch (err) {
                 // Silent fail for individual load
               }
             }
           } catch (err) {
             console.error('Error polling shipper loads:', err);
           }
      }

    } catch (error) {
      console.error('Error in global negotiation polling:', error);
    } finally {
      isPollingRef.current = false;
      hasInitialPollCompletedRef.current = true;
    }
  };

  // Global Polling Logic
  useEffect(() => {
    if (!user) return;

    // Initial poll
    pollNegotiations();

    // Polling enabled for global alerts
    const intervalId = setInterval(pollNegotiations, 15000);
    
    return () => clearInterval(intervalId);
  }, [user]); // Re-run if user changes

  const value = {
    isOpen,
    negotiationData,
    openNegotiation,
    closeNegotiation,
    notifications,
    unreadCount,
    unreadBids, // Export unreadBids set
    addNotification,
    markAsRead,
    markAllAsRead,
    pollNegotiations // Exposed
  };

  return (
    <NegotiationContext.Provider value={value}>
      {children}
    </NegotiationContext.Provider>
  );
};
