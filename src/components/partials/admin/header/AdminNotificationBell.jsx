'use client';

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useNotifications from "@/hooks/useNotifications";
import { useRouter, Link } from "@/i18n/navigation";
import { formatDistanceToNow } from 'date-fns';

const AdminNotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading
  } = useNotifications();

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]); // Added isOpen dependency

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Check if link is provided in data
    const url = notification.data?.link;
    if (url) {
      router.push(url);
    }
    onClose();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
  };

  const getNotificationIcon = (type) => {
    if (type === 'ecom_new_order') return '🛒';
    if (type === 'ecom_product_query' || type === 'ecom_order_query') return '💬';
    return '📢';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:bell-off-outline" className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-primary-50/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title || 'Notification'}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
          <Link href="/admin/notifications" onClick={onClose} className="text-xs font-bold text-primary-600 hover:text-primary-700">
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default function AdminNotificationBell({ userToken }) {
  const { unreadCount, isConnected } = useNotifications(userToken);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${isOpen ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
      >
        <Icon icon="mdi:bell-outline" className="h-[22px] w-[22px]" />

        {/* Connection indicator */}
        <div
          className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white ${isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          title={isConnected ? "Real-time connected" : "Connecting..."}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      <AdminNotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
