import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageNotifications } from '../context/MessageNotificationContext';
import { useNegotiation } from '../context/NegotiationContext';

const GlobalMessagePopup = ({ position = 'top-right' }) => {
  const { queue, remove } = useMessageNotifications();
  const { openNegotiation } = useNegotiation();
  const navigate = useNavigate();

  const containerPos =
    position === 'top-right'
      ? 'top-4 right-4'
      : position === 'top-left'
      ? 'top-4 left-4'
      : position === 'bottom-left'
      ? 'bottom-4 left-4'
      : 'bottom-4 right-4';

  const handleClick = (item) => {
    if (item.negotiationData) {
        openNegotiation(item.negotiationData);
    } else if (item.conversationPath) {
      navigate(item.conversationPath);
    }
    remove(item.id);
  };

  const handleClose = (e, itemId) => {
    e.stopPropagation();
    remove(itemId);
  };

  const getMessageIcon = (message) => {
    if (message.includes('💰') || message.includes('Bid')) return '💰';
    if (message.includes('🚛') || message.includes('Load')) return '🚛';
    if (message.includes('📢') || message.includes('System')) return '📢';
    if (message.includes('🤝') || message.includes('negotiation')) return '🤝';
    return '💬';
  };

  return (
    <div className={`fixed ${containerPos} z-[9999] space-y-3 max-w-[380px] pointer-events-none`}>
      {queue.map((item) => (
        <div
          key={item.id}
          className="animate-slide-in-right pointer-events-auto"
        >
          <button
            onClick={() => handleClick(item)}
            className="w-full rounded-lg shadow-lg bg-white border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex items-start p-4 gap-3 text-left relative group"
          >
            {/* Close button */}
            <button
              onClick={(e) => handleClose(e, item.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            {/* Avatar */}
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0 border-2 border-white shadow-sm">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-blue-600 text-lg font-semibold">
                  {item.senderName?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-gray-900 text-sm truncate pr-2">
                  {item.senderName}
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(item.receivedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getMessageIcon(item.message)}
                </span>
                <div className="text-gray-700 text-sm leading-relaxed break-words">
                  {item.message}
                </div>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default GlobalMessagePopup;

