// hooks/useNotifications.js
import socketService from '@/utils/socketService';
import { useState, useEffect, useCallback } from 'react';


export const useNotifications = (userToken) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userToken) return;

    // Connect socket
    socketService.connect(userToken);

    socketService.requestNotificationPermission();

    // Add listener for socket events
    const unsubscribe = socketService.addListener((event, data) => {
      switch (event) {
        case 'connection':
          setIsConnected(data.status === 'connected');
          break;
        case 'notification':
          setNotifications(prev => [data, ...prev]);
          setUnreadCount(prev => prev + 1);
          break;
        case 'notification_read':
          setUnreadCount(prev => Math.max(0, prev - 1));
          break;
        case 'all_notifications_read':
          setUnreadCount(0);
          break;
        case 'notifications_cleared':
          setNotifications([]);
          setUnreadCount(0);
          break;
      }
    });

    // Load existing notifications
    setNotifications(socketService.getNotifications());
    setUnreadCount(socketService.getUnreadCount());

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [userToken]);

  const markAsRead = useCallback((notificationId) => {
    socketService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    socketService.markAllAsRead();
  }, []);

  const clearNotifications = useCallback(() => {
    socketService.clearNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};