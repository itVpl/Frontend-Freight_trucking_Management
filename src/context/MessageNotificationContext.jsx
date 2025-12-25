import React, { createContext, useContext, useRef, useState } from 'react';

const MessageNotificationContext = createContext(null);

export const useMessageNotifications = () => useContext(MessageNotificationContext);

export const MessageNotificationProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const timersRef = useRef(new Map());

  const push = (item) => {
    const id = item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const data = {
      id,
      senderId: item.senderId,
      senderName: item.senderName || 'User',
      message: item.message || '',
      avatarUrl: item.avatarUrl || '',
      conversationPath: item.conversationPath || '',
      receivedAt: item.receivedAt || Date.now(),
    };
    setQueue((prev) => [data, ...prev].slice(0, 5));
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
    }
    const t = setTimeout(() => remove(id), item.ttlMs || 5000);
    timersRef.current.set(id, t);
  };

  const remove = (id) => {
    setQueue((prev) => prev.filter((n) => n.id !== id));
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  };

  const clear = () => {
    setQueue([]);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  };

  const value = { queue, push, remove, clear };
  return <MessageNotificationContext.Provider value={value}>{children}</MessageNotificationContext.Provider>;
};

