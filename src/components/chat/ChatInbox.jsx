"use client"

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSocket } from '@/contexts/SocketProvider';
import { fetchChatListInto, prefetchChatMessages } from '@/services/chatApi';

// Today: time; this week: weekday; older: date
const listTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const days = (now - d) / 86400000;
    if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString();
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
);

const ChatInbox = ({ onSelectChat, onClose }) => {
    const chats = useSelector((state) => state.chat.chats);
    const unreadCounts = useSelector((state) => state.chat.unreadCounts);
    const onlineUsers = useSelector((state) => state.chat.onlineUsers);
    const typing = useSelector((state) => state.chat.typing);
    
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // New-message sound preference (kept in this browser)
    const [soundOn, setSoundOn] = useState(() => {
        try { return localStorage.getItem('chatSound') !== 'off'; } catch { return true; }
    });
    
    const { connected } = useSocket();
    const store = useStore();

    // Load the newest chats' messages in the background so opening them is instant
    const prefetch = useCallback((chatId) => {
        prefetchChatMessages(dispatch, store.getState, token, chatId);
    }, [dispatch, store, token]);

    const topChatIds = (chats || []).slice(0, 5).map((c) => c?.chatId || c?.id).filter(Boolean).join(',');
    useEffect(() => {
        if (!topChatIds) return undefined;
        // small delay so the list itself renders first
        const t = setTimeout(() => topChatIds.split(',').forEach(prefetch), 300);
        return () => clearTimeout(t);
    }, [topChatIds, prefetch]);

    useEffect(() => {
        if (!token) return;
        
        // Quiet refresh whenever the inbox opens (the list already on screen stays visible)
        fetchChatList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchChatList = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            await fetchChatListInto(dispatch, token);
        } catch (error) {
            // background refresh: only complain when there is nothing to show
            if (!chats?.length) handleError(error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, dispatch]);

    // Live updates (new messages, unread, read, typing, online) come through the socket into the store

    const filteredChats = chats?.filter(chat =>
        chat?.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleChatSelect = useCallback((chat) => {
        onSelectChat({
            otherUserId: chat.otherUser?._id,
            id: chat.chatId,
            chatId: chat.chatId,
            name: chat.otherUser?.name,
            avatar: chat.otherUser?.avatar,
            online: chat.online,
            verified: chat.verified,
            username: chat.otherUser?.username || `@${chat.otherUser?.name?.toLowerCase()}`,
        });
    }, [onSelectChat]);

    return (
        // flex column: header/search keep their size, the list takes the rest and scrolls,
        // so the last chat is never cut off below the box
        <div className="w-screen h-[100dvh] sm:w-96 sm:h-[500px] sm:max-h-[calc(100vh-2rem)] bg-white sm:rounded-lg shadow-xl overflow-hidden sm:border border-gray-200 flex flex-col">
            <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="flex gap-4 items-center">
                    {/* No refresh button: the list updates live over the socket and reloads itself on reconnect */}
                    <button
                        type="button"
                        onClick={() => {
                            const next = !soundOn;
                            setSoundOn(next);
                            try { localStorage.setItem('chatSound', next ? 'on' : 'off'); } catch { /* ignore */ }
                        }}
                        className="hover:opacity-80"
                        aria-label={soundOn ? 'Mute message sound' : 'Turn message sound on'}
                        title={soundOn ? 'Sound on' : 'Sound off'}
                    >
                        <Icon icon={soundOn ? 'mdi:volume-high' : 'mdi:volume-off'} width={19} />
                    </button>
                    <Icon icon="mdi:chevron-down" width={20} onClick={onClose} className="cursor-pointer" />
                </div>
            </div>

            {/* Connection lost: thin strip under the header (keeps the header tidy) */}
            {!connected && (
                <div className="flex items-center justify-center gap-2 px-3 py-1 bg-yellow-50 border-b border-yellow-200 text-[12px] text-yellow-800" role="status">
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-300 border-t-yellow-700" />
                    Connecting…
                </div>
            )}

            <div className="flex items-center px-4 py-3 border-b">
                <div className="flex items-center bg-gray-100 rounded-full w-full px-3 py-1.5">
                    <Icon icon="mdi:magnify" className="text-gray-500" width={20} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent ml-2 outline-none w-full text-base sm:text-sm"
                    />
                </div>
                <Icon icon="mdi:tune-variant" width={24} className="ml-2 text-pink-500" />
            </div>

            <div className="flex justify-between items-center px-4 py-2 text-sm font-semibold">
                <span>Chats ({filteredChats.length})</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pb-2">
                {/* Spinner only on the very first load; later refreshes keep the list on screen */}
                {loading && filteredChats.length === 0 && !searchTerm ? (
                    <LoadingSpinner />
                ) : (!filteredChats || filteredChats.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                        <Icon icon="mdi:message-outline" width={48} className="mx-auto mb-2 opacity-50" />
                        <p>{searchTerm ? 'No chats found' : 'No chats yet'}</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-primary-500 text-sm mt-2 hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat?.chatId || chat?._id}
                            onClick={() => handleChatSelect(chat)}
                            onMouseEnter={() => prefetch(chat?.chatId || chat?.id)}
                            onTouchStart={() => prefetch(chat?.chatId || chat?.id)}
                            className="flex items-start px-4 py-3 hover:bg-gray-50 cursor-pointer relative transition-colors"
                        >
                            <div className="relative">
                                <img
                                    src={chat?.otherUser?.avatar || 'https://i.pravatar.cc/100?img=1'}
                                    alt={chat?.otherUser?.name}
                                    className="w-12 h-12 rounded-md object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://i.pravatar.cc/100?img=1';
                                    }}
                                />
                                <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineUsers.includes(String(chat?.otherUser?._id)) ? 'bg-green-500' : 'bg-gray-400'}`}
                                />
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-sm truncate max-w-[120px]">
                                            {chat?.otherUser?.name || 'Unknown User'}
                                        </span>
                                        <span className="text-sm text-gray-500 truncate max-w-[80px]">
                                            @{chat?.otherUser?.username || chat?.otherUser?.name?.toLowerCase()}
                                        </span>
                                        {chat?.verified && (
                                            <Icon icon="mdi:check-decagram" className="text-primary-500" width={16} />
                                        )}
                                    </div>
                                    <span className={`text-xs shrink-0 ${unreadCounts[chat?.chatId] > 0 ? 'text-pink-600 font-semibold' : 'text-gray-400'}`}>
                                        {listTime(chat?.lastMessage?.timestamp || chat?.lastMessage?.createdAt || chat?.updatedAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate max-w-[200px] ${typing[chat?.chatId] ? 'text-green-600 italic' : unreadCounts[chat?.chatId] > 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                        {typing[chat?.chatId] ? 'typing…' : chat?.lastMessage 
                                            ? (typeof chat.lastMessage === 'object' 
                                                ? (chat.lastMessage.content || 'Media message') 
                                                : chat.lastMessage)
                                            : 'Start a conversation...'
                                        }
                                    </p>
                                    {unreadCounts[chat?.chatId] > 0 && (
                                        <span className="text-xs bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center ml-2">
                                            {unreadCounts[chat?.chatId] > 9 ? '9+' : unreadCounts[chat?.chatId]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatInbox;