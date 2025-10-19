import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  setLoading 
} from '@/store/notifications';
import axiosInstance from '@/config/axiosInstance';

const useNotifications = () => {
  const dispatch = useDispatch();
  
  const { list, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );

  // Get auth token
  const token = useSelector((state) => state.auth.token);

  // Fetch notifications from backend
  const fetchNotifications = async (page = 1, limit = 20, type = null) => {
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
      dispatch(setLoading(false));
    }
  };

  const fetchUnreadCount = async () => {
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
  };

  const markNotificationAsRead = async (notificationId) => {
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
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
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
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from Redux store
        dispatch(setNotifications(
          list.filter(n => n._id !== notificationId)
        ));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

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