'use client';

import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import useNotifications from '@/hooks/useNotifications';
import { useRouter } from '@/i18n/navigation';
import { formatDistanceToNow } from 'date-fns';
import { getRedirectUrl } from '@/constant/notificationRoutes';
import { useSelector } from 'react-redux';

export default function SellerNotificationsPage() {
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const router = useRouter();
  const auth = useSelector(s => s.auth);
  const userRole = auth?.userType || auth?.user?.role || 'seller';

  useEffect(() => {
    fetchNotifications(1, 50); // Fetch more for full page
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Check if link is provided in data
    let url = notification.data?.link;
    if (!url) {
      // Fallback to route builder if any
      url = getRedirectUrl(userRole, notification.type, notification.data);
    }

    if (url) {
      router.push(url);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'ecom_new_order') return '🛒';
    if (type === 'ecom_product_query' || type === 'ecom_order_query') return '💬';
    return '📢';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Stay updated on your store activities.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 flex gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:bell-off-outline" className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 ${!notification.isRead ? 'bg-primary-50/20' : ''}`}
              >
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title || 'Notification'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {!notification.isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      New
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete notification"
                  >
                    <Icon icon="mdi:delete-outline" className="text-xl" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
