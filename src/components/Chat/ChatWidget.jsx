// components/Chat/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Send, X, Paperclip, Smile, User, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const ChatWidget = ({ receiverId, receiverName, loadId, onClose }) => {
  const { socket, connected, sendMessage } = useSocket();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to chat');
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
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, loadId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (data.senderId === receiverId) {
        setMessages(prev => [...prev, {
          _id: Date.now(),
          sender: data.senderId,
          message: data.message,
          createdAt: data.timestamp || new Date(),
          isRead: true
        }]);
        
        // Auto scroll to bottom
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

  // Auto focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.warning('Message cannot be empty');
      return;
    }

    if (!connected) {
      toast.error('Not connected to chat server');
      return;
    }

    setSending(true);

    try {
      const success = sendMessage(receiverId, message, loadId);
      
      if (success) {
        // Add message to local state optimistically
        setMessages(prev => [...prev, {
          _id: Date.now(),
          sender: 'me',
          message,
          createdAt: new Date(),
          isRead: true
        }]);
        
        setMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      toast.error('Failed to send message');
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

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 z-[9999] flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User size={18} className="text-blue-600" />
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
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No messages yet</div>
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
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <Clock size={10} />
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
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