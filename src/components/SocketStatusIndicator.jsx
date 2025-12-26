import React from 'react';
import { useSocket } from '../context/SocketContext';

const SocketStatusIndicator = ({ position = 'bottom-left' }) => {
  const { connected, reconnectionAttempts } = useSocket();

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  if (connected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-[9998]`}>
      <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2">
          {reconnectionAttempts > 0 ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
          <span className="text-sm font-medium">
            {reconnectionAttempts > 0 
              ? `Reconnecting... (${reconnectionAttempts}/5)` 
              : 'Disconnected'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocketStatusIndicator;