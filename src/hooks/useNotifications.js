// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import socketService from '@/utils/socketService';

export const useNotifications = (userToken) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1) => {
    if (!userToken) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/notifications?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        console.log('Notifications fetched from API:', data.data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userToken, API_BASE]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userToken, API_BASE]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!userToken || !notificationId) return;

    try {
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('Notification marked as read:', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userToken, API_BASE]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        console.log('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userToken, API_BASE]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!userToken || !notificationId) return;

    try {
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Decrease unread count if notification was unread
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        console.log('Notification deleted:', notificationId);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [userToken, API_BASE, notifications]);


  
  // Clear all notifications (local only)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    socketService.clearNotifications();
    console.log('Local notifications cleared');
  }, []);

  // Setup socket listener and fetch initial notifications
  useEffect(() => {
    if (!userToken) return;

    // Fetch notifications from API on mount
    fetchNotifications();

    // Setup socket listener for real-time notifications
   const unsubscribe = socketService.addListener((event, data) => {
    console.log('Socket notification event received:', event, data);

    if (event === 'notification') {
      setNotifications(prev => [data, ...prev]);
      if (!data.read && !data.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    }

    if (event === 'booking_status_update') {
      // 👇 yahan booking updates handle kar sakte ho
      const newNotification = {
        _id: Date.now().toString(), // temp ID
        type: 'booking_status_update',
        bookingId: data.bookingId,
        status: data.status,
        isRead: false,
        createdAt: new Date().toISOString(),
        ...data
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      console.log(`📩 Booking ${data.bookingId} updated to ${data.status}`);
    }

    if (event === 'notification_read') {
      markAsRead(data.id);
    }

    if (event === 'all_notifications_read') {
      markAllAsRead();
    }

    if (event === 'notifications_cleared') {
      clearNotifications();
    }
  });


    return () => {
      unsubscribe();
    };
  }, [userToken, fetchNotifications, markAsRead, markAllAsRead, clearNotifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    refreshNotifications,
    fetchUnreadCount
  };
};