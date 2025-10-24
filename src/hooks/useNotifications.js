import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications, 
  markAsRead, 
  markAllAsRead, 
  setLoading 
} from '@/store/notifications';
import axiosInstance from '@/config/axiosInstance';
import { useCallback } from 'react';

const useNotifications = () => {
  const dispatch = useDispatch();
  
  const { list, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );

  const token = useSelector((state) => state.auth.token);

  // ✅ Stable function using useCallback
  const fetchNotifications = useCallback(async (page = 1, limit = 20, type = null) => {
    try {
      dispatch(setLoading(true));
      const params = { page, limit };
      if (type) params.type = type;

      const response = await axiosInstance.get(`/notifications`, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        dispatch(setNotifications(response.data.data.notifications));
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, token]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        return response.data.data.unreadCount;
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [token]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        dispatch(markAsRead(notificationId));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [dispatch, token]);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const response = await axiosInstance.patch(
        `/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        dispatch(markAllAsRead());
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [dispatch, token]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        dispatch(setNotifications(
          list.filter(n => n._id !== notificationId)
        ));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [dispatch, token, list]);

  return {
    notifications: list,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification,
  };
};

export default useNotifications;
