import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationPanel = ({ userToken, isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications(userToken);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'new_job') {
      window.location.href = `/repairman/jobs/${notification.data.jobId}`;
    } else if (notification.type === 'offer_accepted') {
      window.location.href = `/repairman/bookings/${notification.data.bookingId}`;
    }
    
    onClose();
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
    switch (notification.type) {
      case 'new_job':
        return 'New Job Available';
      case 'offer_accepted':
        return 'Offer Accepted!';
      case 'offer_rejected':
        return 'Offer Update';
      case 'job_cancelled':
        return 'Job Cancelled';
      default:
        return 'Notification';
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case 'new_job':
        return (
          <div>
            <div className="font-medium">{notification.data.title}</div>
            <div className="text-sm text-gray-600">
              Budget: {notification.data.budget.min}-{notification.data.budget.max} PKR
            </div>
            <div className="text-sm text-gray-500">
              {notification.data.location.city} • {notification.data.urgency} priority
            </div>
          </div>
        );
      case 'offer_accepted':
        return (
          <div>
            <div className="font-medium">{notification.data.jobTitle}</div>
            <div className="text-sm text-green-600">
              Amount: {notification.data.totalAmount} PKR
            </div>
            <div className="text-sm text-gray-500">
              Service: {notification.data.serviceType}
            </div>
          </div>
        );
      case 'offer_rejected':
        return (
          <div>
            <div className="font-medium">{notification.data.jobTitle}</div>
            <div className="text-sm text-gray-600">
              Job assigned to another repairman
            </div>
          </div>
        );
      case 'job_cancelled':
        return (
          <div>
            <div className="font-medium">{notification.data.jobTitle}</div>
            <div className="text-sm text-gray-600">
              Reason: {notification.data.cancellationReason}
            </div>
          </div>
        );
      default:
        return <div className="text-sm">{notification.message}</div>;
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
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={clearNotifications}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900">
                      {getNotificationTitle(notification)}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
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


export default NotificationPanel