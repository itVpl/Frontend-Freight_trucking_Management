import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, X, Paperclip, Smile, Minimize2, Maximize2 } from 'lucide-react';

const ChatWindow = ({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName, 
  loadId = null,
  position = { bottom: 20, right: 20 }
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, connected } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when window opens
  useEffect(() => {
    if (isOpen && recipientId) {
      loadChatHistory();
    }
  }, [isOpen, recipientId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.senderId === recipientId || data.receiverId === recipientId) {
        const message = {
          id: Date.now(),
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          timestamp: new Date(data.timestamp || Date.now()),
          loadId: data.loadId
        };
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, recipientId]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      // You can implement API call to load chat history here
      // For now, we'll start with empty messages
      setMessages([]);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !connected || !socket) return;

    const messageData = {
      receiverId: recipientId,
      message: newMessage.trim(),
      loadId: loadId,
      timestamp: new Date().toISOString()
    };

    // Emit message via socket
    socket.emit('send_message', messageData);

    // Add to local messages immediately
    const localMessage = {
      id: Date.now(),
      senderId: 'me',
      senderName: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      loadId: loadId
    };

    setMessages(prev => [...prev, localMessage]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] flex flex-col"
      style={{
        bottom: position.bottom,
        right: position.right,
        width: isMinimized ? '300px' : '400px',
        height: isMinimized ? '60px' : '500px',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
            {recipientName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-medium text-sm">{recipientName || 'Unknown'}</div>
            {loadId && (
              <div className="text-xs opacity-80">Load: {loadId.slice(-8)}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                Start a conversation...
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.senderId === 'me'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="break-words">{message.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  style={{ minHeight: '38px', maxHeight: '100px' }}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Add emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !connected}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Connection Status */}
            {!connected && (
              <div className="mt-2 text-xs text-red-500 text-center">
                Disconnected - Messages will be sent when reconnected
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;