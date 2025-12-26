import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Avatar } from '@mui/material';

const GlobalMessageListener = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      // Prevent self-notifications
      const currentUserId = user?._id || user?.userId;
      const senderId = data.senderId || data.sender?._id;
      
      // Ensure IDs are compared as strings to avoid type mismatches
      if (currentUserId && senderId && String(currentUserId) === String(senderId)) return;

      // Normalize data
      const message = data.message || data.content;
      const senderName = data.senderName || data.sender?.name || data.sender?.compName || 'New Message';
      const avatarUrl = data.avatarUrl || data.senderAvatar || data.sender?.profileImage;
      const conversationPath = data.conversationPath || (data.conversationId ? `/messages/${data.conversationId}` : null);

      // Check if we are already on the screen
      const sameScreen = conversationPath && location.pathname === conversationPath;
      if (sameScreen) return;

      const ToastContent = () => (
        <div 
            onClick={() => conversationPath && navigate(conversationPath)} 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
            <span style={{ fontWeight: 'bold' }}>{senderName}</span>
            <span style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message}
            </span>
        </div>
      );

      toast(<ToastContent />, {
        icon: avatarUrl ? <Avatar src={avatarUrl} sx={{ width: 24, height: 24 }} /> : '💬',
        onClick: () => conversationPath && navigate(conversationPath)
      });
    };

    // Listen to multiple event types to cover all bases
    const events = ['chat:new', 'new_message', 'receive_message', 'chat_message', 'message'];
    
    events.forEach(event => socket.on(event, handleMessage));

    return () => {
        events.forEach(event => socket.off(event, handleMessage));
    };
  }, [socket, location.pathname, navigate, user]);

  return null;
};

export default GlobalMessageListener;

