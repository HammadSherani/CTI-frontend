"use client"

import React from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';

const MessageBar = React.memo(({ onClick }) => {
    // Direct Redux selector for real-time updates
    const unreadCounts = useSelector((state) => state.chat.unreadCounts);
    const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
        <div
            onClick={onClick}
            className="w-[360px] h-12 bg-[#0E1014] text-white flex items-center justify-between px-4 rounded-t-md shadow-md cursor-pointer relative"
        >
            <span className="text-sm font-medium">Messages</span>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Icon icon="mdi:bell-outline" width="20" height="20" />
                    {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </span>
                    )}
                </div>
                <Icon icon="mdi:chevron-up" width="20" height="20" />
            </div>
        </div>
    );
});

export default MessageBar;