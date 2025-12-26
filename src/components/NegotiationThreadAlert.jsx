import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

const NegotiationThreadAlert = () => {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for negotiation_thread_accessed event
    const handleNegotiationThreadAccessed = (data) => {
      console.log('🔔 Negotiation Thread Accessed:', data);
      
      // Create alert message
      const alertMessage = `
        Bid ID: ${data.bidId}
        Accessed By: ${data.accessedBy}
        User ID: ${data.accessedByUserId}
        Time: ${new Date(data.timestamp).toLocaleString()}
        Unread Status - Shipper: ${data.unreadStatus.shipper}, Inhouse: ${data.unreadStatus.inhouse}
      `;

      // Show browser alert
      alert(`Negotiation Thread Accessed!\n${alertMessage}`);

      // Show toast notification
      toast.info(`🔔 Negotiation Thread Accessed by ${data.accessedBy} for Bid: ${data.bidId}`, {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Also add to state for UI display
      const newAlert = {
        id: Date.now(),
        ...data,
        timestamp: new Date(data.timestamp)
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only last 5 alerts

      // Auto remove alert after 10 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
      }, 10000);
    };

    // Register event listener
    socket.on('negotiation_thread_accessed', handleNegotiationThreadAccessed);

    // Cleanup
    return () => {
      socket.off('negotiation_thread_accessed', handleNegotiationThreadAccessed);
    };
  }, [socket]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in"
        >
          <div className="font-bold text-sm mb-2">🔔 Negotiation Thread Accessed</div>
          <div className="text-xs space-y-1">
            <div><strong>Bid ID:</strong> {alert.bidId}</div>
            <div><strong>Accessed By:</strong> {alert.accessedBy}</div>
            <div><strong>User ID:</strong> {alert.accessedByUserId}</div>
            <div><strong>Time:</strong> {alert.timestamp.toLocaleString()}</div>
            <div>
              <strong>Unread:</strong> Shipper: {alert.unreadStatus.shipper}, 
              Inhouse: {alert.unreadStatus.inhouse}
            </div>
          </div>
          <button
            onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            className="absolute top-1 right-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NegotiationThreadAlert;