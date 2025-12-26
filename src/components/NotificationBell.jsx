// components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, Check, MessageSquare, DollarSign, AlertCircle, Trash2, Clock } from 'lucide-react';
import { useSnackbar } from 'notistack';
import messageService from '../services/messageService';

const NotificationBell = () => {
  const { 
    notifications = [], 
    chats = [],
    markAsRead = () => {}, 
    markAllAsRead = () => {}, 
    clearNotifications = () => {},
    markMessageAsRead = () => {},
    getUnreadCount = () => 0,
    getUnreadMessages = () => 0,
    connected = false
  } = useSocket() || {};
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'messages', 'bids', 'system'
  const [latestMessages, setLatestMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  // Auto-refresh function - Only show very recent messages (last 30 minutes)
  const refreshNotifications = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch latest messages
      const messagesResponse = await messageService.getLatestMessages();
      if (messagesResponse.success) {
        // Filter messages to show only last 30 minutes (very recent)
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        
        const recentMessages = messagesResponse.messages.filter(msg => {
          const msgDate = new Date(msg.timestamp || msg.createdAt);
          return msgDate >= thirtyMinutesAgo;
        });
        
        console.log(`🔄 Auto-refresh: Found ${recentMessages.length} messages from last 30 minutes`);
        setLatestMessages(recentMessages);
      }
      
      // Fetch unread count
      const countResponse = await messageService.getUnreadCount();
      if (countResponse.success) {
        setUnreadCount(countResponse.count || 0);
      }
      
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    // Initial load
    refreshNotifications();
    
    // Set up interval for auto-refresh
    const interval = setInterval(refreshNotifications, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = getUnreadCount();
  const unreadMessages = getUnreadMessages();
  const totalUnread = unreadNotifications + unreadMessages + unreadCount;

  // Filter notifications by type - only show recent messages (last 30 minutes)
  const filteredNotifications = () => {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    // Filter notifications to last 30 minutes only
    const recentNotifications = notifications.filter(n => {
      const notifDate = new Date(n.timestamp || n.createdAt);
      return notifDate >= thirtyMinutesAgo;
    });
    
    // Filter chats to last 30 minutes only
    const recentChats = chats.filter(c => {
      const chatDate = new Date(c.timestamp || c.createdAt);
      return chatDate >= thirtyMinutesAgo;
    });
    
    // Add latest messages from API (already filtered to 30 minutes)
    const recentApiMessages = latestMessages.map(msg => ({
      ...msg,
      itemType: 'message',
      senderName: msg.senderName || msg.from || msg.sender || msg.name,
      message: msg.message || msg.content || msg.text,
      senderId: msg.senderId || msg.from_id || msg.sender
    }));

    const allItems = [
      ...recentNotifications.map(n => ({ ...n, itemType: 'notification' })),
      ...recentChats.map(c => ({ 
        ...c, 
        itemType: 'message',
        senderName: c.senderName || c.sender || c.from || c.name
      })),
      ...recentApiMessages
    ];

    // Remove duplicates based on id
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id || i._id === item._id)
    );

    // Sort by timestamp (newest first)
    uniqueItems.sort((a, b) => {
      const aTime = new Date(a.timestamp || a.createdAt);
      const bTime = new Date(b.timestamp || b.createdAt);
      return bTime - aTime;
    });

    // Filter by tab and limit to top 10 recent items (reduced from 20)
    let filteredItems;
    switch(activeTab) {
      case 'messages':
        filteredItems = uniqueItems.filter(item => item.itemType === 'message');
        break;
      case 'bids':
        filteredItems = uniqueItems.filter(item => 
          item.itemType === 'notification' && 
          ['new_bid', 'bid_accepted', 'bid_rejected'].includes(item.type)
        );
        break;
      case 'negotiations':
        filteredItems = uniqueItems.filter(item => 
          item.itemType === 'notification' && 
          item.type === 'negotiation'
        );
        break;
      case 'system':
        filteredItems = uniqueItems.filter(item => 
          item.itemType === 'notification' && 
          ['load_status', 'tracking'].includes(item.type)
        );
        break;
      default:
        filteredItems = uniqueItems;
    }

    // Return only top 10 recent items (reduced for better performance)
    return filteredItems.slice(0, 10);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (item) => {
    if (item.itemType === 'message') {
      return <MessageSquare size={16} className="text-blue-500" />;
    }

    switch(item.type) {
      case 'new_bid': 
        return <DollarSign size={16} className="text-green-500" />;
      case 'bid_accepted': 
        return <Check size={16} className="text-green-600" />;
      case 'bid_rejected': 
        return <AlertCircle size={16} className="text-red-500" />;
      case 'negotiation':
        return <MessageSquare size={16} className="text-purple-500" />;
      default: 
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleItemClick = (item) => {
    if (item.itemType === 'message') {
      // Open chat with sender
      markMessageAsRead(item.senderId);
      window.dispatchEvent(new CustomEvent('open-chat-window', {
        detail: { 
          senderId: item.senderId, 
          senderName: item.senderName 
        }
      }));
    } else {
      // Handle notification click
      if (!item.read) {
        markAsRead(item.id);
      }

      // Action based on notification type
      switch(item.type) {
        case 'new_bid':
          if (item.data?.loadId) {
            window.location.href = `/loadboard?loadId=${item.data.loadId}`;
          }
          break;
        case 'negotiation':
          if (item.data?.bidId) {
            window.dispatchEvent(new CustomEvent('open-negotiation', {
              detail: { bidId: item.data.bidId }
            }));
          }
          break;
        case 'load_status':
          if (item.data?.loadId) {
            window.location.href = `/consignment?loadId=${item.data.loadId}`;
          }
          break;
      }
    }
    
    setIsOpen(false);
  };

  const tabs = [
    { key: 'all', label: 'All', count: filteredNotifications().length },
    { key: 'messages', label: 'Messages', count: filteredNotifications().filter(item => item.itemType === 'message').length },
    { key: 'bids', label: 'Bids', count: filteredNotifications().filter(item => item.itemType === 'notification' && ['new_bid', 'bid_accepted', 'bid_rejected'].includes(item.type)).length },
    { key: 'negotiations', label: 'Negotiations', count: filteredNotifications().filter(item => item.itemType === 'notification' && item.type === 'negotiation').length },
    { key: 'system', label: 'System', count: filteredNotifications().filter(item => item.itemType === 'notification' && ['load_status', 'tracking'].includes(item.type)).length }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Refresh data when opening dropdown
          if (!isOpen) {
            refreshNotifications();
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-700 dark:text-gray-300" />
        
        {/* Connection Status Badge */}
        {!connected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10"></div>
        )}
        
        {/* Refresh indicator */}
        {isRefreshing && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-spin z-10"></div>
        )}
        
        {/* Unread Badge */}
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Notifications 
                {isRefreshing && <span className="text-blue-500 text-xs ml-2 animate-pulse">🔄 Auto-refreshing...</span>}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {connected ? 'Connected' : 'Disconnected'}
                </div>
                <span className="text-xs text-gray-500">
                  {totalUnread} unread • Last 30 minutes only • Auto-refresh: 2s
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={refreshNotifications}
                disabled={isRefreshing}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                title="Refresh notifications"
              >
                <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {filteredNotifications().length > 0 && (
                <>
                  {totalUnread > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead();
                        chats.forEach(c => markMessageAsRead(c.senderId));
                        enqueueSnackbar('All marked as read', { variant: 'success' });
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Mark all as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      clearNotifications();
                      setChats([]);
                      enqueueSnackbar('All cleared', { variant: 'info' });
                    }}
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {filteredNotifications().length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No recent messages</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {activeTab === 'all' 
                    ? 'Messages from last 30 minutes will appear here'
                    : `No recent ${activeTab} from last 30 minutes`
                  }
                </p>
                <p className="text-xs text-blue-500 mt-2">
                  🔄 Auto-refreshing every 2 seconds
                </p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {filteredNotifications().map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      (!item.read || (item.itemType === 'message' && !item.read)) 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(item)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium text-sm ${
                            (!item.read || (item.itemType === 'message' && !item.read))
                              ? 'text-gray-900 dark:text-gray-100 font-semibold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {item.itemType === 'message' 
                              ? `Message from ${item.senderName}`
                              : item.title
                            }
                          </h4>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.itemType === 'message' ? item.message : item.body}
                        </p>
                        
                        {/* Additional Info */}
                        {item.data && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            {item.data.rate && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Rate:</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  ${Number(item.data.rate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {item.data.loadId && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Load:</span>
                                <span className="font-mono text-xs">{item.data.loadId.substring(0, 8)}...</span>
                              </div>
                            )}
                            {item.data.status && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Status:</span>
                                <span className="capitalize">{item.data.status}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Action Button for Messages */}
                        {item.itemType === 'message' && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                              }}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications().length > 0 && (
            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center">
              <div className="text-xs text-gray-500 mb-2">
                Showing messages from last 30 minutes only • Auto-refresh: 2s
              </div>
              <button
                onClick={() => {
                  // Navigate to notifications page if you have one
                  setIsOpen(false);
                }}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;