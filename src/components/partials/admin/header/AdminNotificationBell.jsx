'use client';

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useNotifications from "@/hooks/useNotifications";
import { useSocket } from "@/contexts/SocketProvider";
import { useRouter, Link } from "@/i18n/navigation";
import { formatDistanceToNow } from 'date-fns';

const AdminNotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading
  } = useNotifications();

  const router = useRouter();
  // Notifications that were unread when the panel opened stay highlighted while it is open
  const [newIds, setNewIds] = useState(() => new Set());

  // Opening the panel = "seen": refresh the list, then clear the bell count (saved on the server)
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    (async () => {
      const data = await fetchNotifications();
      if (cancelled) return;
      const fresh = data?.notifications || notifications;
      const unread = fresh.filter((n) => !n.isRead).map((n) => String(n._id));
      if (unread.length) {
        setNewIds(new Set(unread));
        markAllAsRead();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isNew = (n) => !n.isRead || newIds.has(String(n._id));

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
    if (type === 'partOrder' || type === 'parts_order_received') return '📦';
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
        {/* Skeleton only on the very first load; afterwards the list is already there */}
        {isLoading && notifications.length === 0 ? (
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
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isNew(notification) ? 'bg-primary-50/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${isNew(notification) ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
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
                  {isNew(notification) && (
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
  const { unreadCount, fetchNotifications } = useNotifications(userToken);
  const { connected: isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load the count on page load (not only when the panel is opened), and again after a
  // socket (re)connect; new notifications then arrive live through the socket.
  useEffect(() => {
    fetchNotifications();
  }, [isConnected, fetchNotifications]);

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
            <span key={`badge-${unreadCount}`} translate="no" className="notranslate">{unreadCount > 99 ? "99+" : unreadCount}</span>
          </div>
        )}
      </button>

      <AdminNotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
