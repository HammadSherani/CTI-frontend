'use client';

import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/hooks/useNotifications';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    fetchNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'new_job') {
      window.location.href = `/repair-man/job-board/${notification.data.jobId}`;
    } else if (notification.type === 'offer_accepted') {
      window.location.href = `/repairman/bookings/${notification.data.bookingId}`;
    }
    
    onClose();
  };

  const handleClearAll = async () => {
    for (const notification of notifications) {
      await deleteNotification(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_job':
        return '🔧';
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'job_cancelled':
        return '🚫';
      default:
        return '📢';
    }
  };

  const getNotificationTitle = (notification) => {
    return notification.title || 'Notification';
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'new_job':
        return (
          <div>
            <div className="text-[13px] text-gray-700">{notification.message}</div>
            {notification.data?.budget && (
              <div className="text-[13px] text-gray-600 mt-[3px]">
                Budget: {notification.data.budget.min}-{notification.data.budget.max} {notification.data.budget.currency}
              </div>
            )}
            {notification.data?.city && (
              <div className="text-sm text-gray-500">
                 {notification.data.city}
              </div>
            )}
          </div>
        );
      case 'offer_accepted':
        return (
          <div>
            <div className="text-sm text-gray-700">{notification.message}</div>
            {notification.data?.totalAmount && (
              <div className="text-sm text-green-600 mt-1">
                Amount: {notification.data.totalAmount} TRY
              </div>
            )}
            {notification.data?.serviceType && (
              <div className="text-sm text-gray-500">
                Service: {notification.data.serviceType}
              </div>
            )}
          </div>
        );
      case 'offer_rejected':
      case 'job_cancelled':
        return (
          <div>
            <div className="text-sm text-gray-700">{notification.message}</div>
            {notification.data?.cancellationReason && (
              <div className="text-sm text-gray-600 mt-1">
                Reason: {notification.data.cancellationReason}
              </div>
            )}
          </div>
        );
      default:
        return <div className="text-sm text-gray-700">{notification.message}</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                !notification.isRead ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div> */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="text-[13px] text-gray-900">
                      {getNotificationTitle(notification)}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {getNotificationContent(notification)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;