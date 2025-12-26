// components/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, X, Paperclip, Smile, Minimize2, Maximize2 } from 'lucide-react';
import { useSnackbar } from 'notistack';

const ChatWidget = ({ receiverId, receiverName, loadId, onClose, onMinimize }) => {
  const { socket, connected, sendMessage } = useSocket();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  // Load existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          enqueueSnackbar('Please login to chat', { variant: 'error' });
          return;
        }

        const response = await fetch(
          `/api/chats?receiverId=${receiverId}${loadId ? `&loadId=${loadId}` : ''}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMessages(data.messages || []);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        enqueueSnackbar('Failed to load messages', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, loadId, enqueueSnackbar]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (data.senderId === receiverId) {
        setMessages(prev => [...prev, {
          _id: Date.now(),
          sender: 'them',
          message: data.message,
          senderName: data.senderName,
          createdAt: data.timestamp || new Date(),
          isRead: true
        }]);
        
        // Auto scroll
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [socket, receiverId]);

  // Auto focus and scroll
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      enqueueSnackbar('Message cannot be empty', { variant: 'warning' });
      return;
    }

    if (!connected) {
      enqueueSnackbar('Not connected to chat server', { variant: 'error' });
      return;
    }

    setSending(true);

    try {
      const success = sendMessage(receiverId, message, loadId);
      
      if (success) {
        // Add to local state
        setMessages(prev => [...prev, {
          _id: Date.now(),
          sender: 'me',
          message,
          createdAt: new Date(),
          isRead: true
        }]);
        
        setMessage('');
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      enqueueSnackbar('Failed to send message', { variant: 'error' });
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-64 bg-blue-500 text-white rounded-lg shadow-lg z-[9999]">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-medium truncate">{receiverName}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-white/20 rounded"
              title="Maximize"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 z-[9999] flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="font-semibold text-blue-600">
                {receiverName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{receiverName || 'Chat'}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-blue-100">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              title="Minimize"
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">No messages yet</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a conversation with {receiverName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'them' && (
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {msg.senderName}
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Paperclip size={20} />
          </button>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Smile size={20} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={!connected || sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || !connected || sending}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {!connected && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Not connected to chat server
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatWidget;