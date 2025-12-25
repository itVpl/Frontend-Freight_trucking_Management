import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Bell, AlertCircle } from 'lucide-react';

const NotificationAlert = ({ message, sender, onClose, autoHide = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Play notification sound (optional)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
      } catch (e) {
        // Ignore audio errors
      }
      
      if (autoHide) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, autoHide, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-16 right-4 z-[9999]">
      <div 
        className={`
          bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 
          shadow-2xl rounded-lg p-4 max-w-sm min-w-[320px]
          transform transition-all duration-300 ease-in-out cursor-pointer
          hover:shadow-3xl hover:scale-105
          ${isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[-20px] opacity-0 scale-95'
          }
        `}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={() => {
          // Open chat with the sender when clicking anywhere on notification
          if (sender && sender !== 'Unknown' && sender !== 'System') {
            window.dispatchEvent(new CustomEvent('open-chat-window', {
              detail: { 
                senderId: sender, 
                senderName: sender 
              }
            }));
            handleClose();
          }
        }}
      >
        {/* Header with pulse animation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                New Message
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Just now
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">From:</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {sender || 'Shyam Singh'}
            </span>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-blue-100 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {message}
            </p>
            {sender && sender !== 'Shyam Singh' && sender !== 'System' && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                💬 Click anywhere to reply
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-2 py-1 rounded transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              // Open chat with the sender
              if (sender && sender !== 'Shyam Singh' && sender !== 'System') {
                window.dispatchEvent(new CustomEvent('open-chat-window', {
                  detail: { 
                    senderId: sender, 
                    senderName: sender 
                  }
                }));
              } else {
                // Trigger notification bell click to open notifications
                const bellButton = document.querySelector('[aria-label="Notifications"]');
                if (bellButton) {
                  bellButton.click();
                }
              }
              handleClose();
            }}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            {sender && sender !== 'Shyam Singh' && sender !== 'System' ? 'Reply' : 'View All'}
          </button>
        </div>

        {/* Progress bar for auto-hide */}
        {autoHide && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all ease-linear"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationAlert;