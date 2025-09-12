// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import socketService from '@/utils/socketService';

export const useNotifications = (userToken) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userToken) return;

    const unsubscribe = socketService.addListener((event, data) => {
      console.log('Notification event received:', event, data); // Debug log
      if (event === 'notification') {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    // Load existing notifications
    setNotifications(socketService.getNotifications());
    setUnreadCount(socketService.getUnreadCount());

    return unsubscribe;
  }, [userToken]);

  return {
    notifications,
    unreadCount,
    markAsRead: () => {},
    markAllAsRead: () => {},
    clearNotifications: () => {}
  };
};