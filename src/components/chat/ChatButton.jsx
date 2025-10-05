"use client"

import React from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useChat } from '../../hooks/useChat';

export const ChatButton = ({ className = "" }) => {
    // Direct Redux selector for real-time updates
    const unreadCounts = useSelector((state) => state.chat.unreadCounts);
    const hasUser = useSelector((state) => !!state.chat.currentUser);
    const { openChat } = useChat();

    if (!hasUser) {
        return null;
    }

    const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
        <button
            onClick={openChat}
            className={`relative p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors ${className}`}
        >
            <Icon icon="mdi:message" width={24} />
            {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
            )}
        </button>
    );
};