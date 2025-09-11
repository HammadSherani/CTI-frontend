import React from "react";
import { Icon } from "@iconify/react";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationBell = ({ userToken }) => {
  const { unreadCount, isConnected } = useNotifications(userToken);

  return (
    <div className="relative">
      <button className="relative p-2 text-gray-600 hover:text-gray-900">
        {/* Bell icon from Iconify */}
        <Icon icon="mdi:bell-outline" className="h-6 w-6" />

        {/* Connection indicator */}
        <div
          className={`absolute -top-1 -left-1 h-3 w-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
