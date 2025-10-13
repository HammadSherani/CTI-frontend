"use client"

import React, { useEffect, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import {
    loadUserChats,
    resetUnreadCount
} from '../../store/chat';
import { useSocket } from '@/contexts/SocketProvider';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
);

const ChatInbox = ({ onSelectChat, onClose }) => {
    const chats = useSelector((state) => state.chat.chats);
    const unreadCounts = useSelector((state) => state.chat.unreadCounts);
    const selectedChat = useSelector((state) => state.chat.selectedChat);

    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        socket,
        connected,
        joinChat,
        leaveChat
    } = useSocket();

    useEffect(() => {
        console.log('=== ChatInbox Re-render Check ===');
        console.log('Chats length:', chats?.length);
        console.log('Unread counts:', unreadCounts);
        console.log('Component rendered at:', new Date().toISOString());
        console.log('Chats data:', chats);
    }, [chats, unreadCounts]);

    useEffect(() => {
        if (socket && connected && chats && chats.length > 0) {
            console.log('Auto-joining all chats for inbox notifications');

            chats.forEach(chat => {
                const chatId = chat.chatId || chat.id;
                if (chatId) {
                    console.log('Joining chat for notifications:', chatId);
                    joinChat(chatId);
                }
            });

            return () => {
                console.log('Leaving all chats - ChatInbox cleanup');
                chats.forEach(chat => {
                    const chatId = chat.chatId || chat.id;
                    if (chatId) {
                        leaveChat(chatId);
                    }
                });
            };
        }
    }, [socket, connected, chats, joinChat, leaveChat]);

    useEffect(() => {
        if (socket && connected) {
            console.log('Setting up ChatInbox socket listeners');

            // Listen for messages marked as read
            const handleMessagesRead = (data) => {
                console.log('ChatInbox: Messages marked as read:', data);
                dispatch(resetUnreadCount({
                    chatId: data.chatId
                }));
            };

            socket.on('messages_read', handleMessagesRead);

            return () => {
                console.log('Cleaning up ChatInbox socket listeners');
                socket.off('messages_read', handleMessagesRead);
            };
        }
    }, [socket, connected, dispatch]);

    const fetchChatList = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/chat/list", {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Raw chat data from API:', data.chats);

            const processedChats = (data.chats || []).map(chat => {
                console.log('Processing individual chat:', chat);
                return {
                    ...chat,
                    id: chat.chatId
                };
            });

            const unreadCountsFromAPI = {};
            data.chats.forEach(chat => {
                if (chat.unreadCount > 0) {
                    unreadCountsFromAPI[chat.chatId] = chat.unreadCount;
                }
            });

            console.log('Processed chats:', processedChats);
            console.log('Extracted unread counts:', unreadCountsFromAPI);

            dispatch(loadUserChats({
                chats: processedChats,
                messages: {},
                unreadCounts: unreadCountsFromAPI
            }));
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [token, dispatch]);

    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

    const filteredChats = chats?.filter(chat =>
        chat?.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleChatSelect = useCallback((chat) => {
        console.log('Selected chat object:', chat);
        console.log('Chat ID:', chat.chatId);

        onSelectChat({
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
        <div className="w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 h-[500px]">
            <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="flex gap-4 items-center">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                        title={connected ? 'Connected' : 'Disconnected'} />
                    <Icon icon="mdi:chevron-down" width={20} onClick={onClose} className="cursor-pointer" />
                </div>
            </div>

            <div className="flex items-center px-4 py-3 border-b">
                <div className="flex items-center bg-gray-100 rounded-full w-full px-3 py-1.5">
                    <Icon icon="mdi:magnify" className="text-gray-500" width={20} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent ml-2 outline-none w-full"
                    />
                </div>
                <Icon icon="mdi:tune-variant" width={24} className="ml-2 text-pink-500" />
            </div>

            <div className="flex justify-between items-center px-4 py-2 text-sm font-semibold">
                <span>Chats ({filteredChats.length})</span>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
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
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat?.online ? 'bg-green-500' : 'bg-gray-400'}`}
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
                                    <span className="text-xs text-gray-400">
                                        {typeof chat?.lastMessage === 'object' && chat?.lastMessage?.timestamp ?
                                            new Date(chat.lastMessage.timestamp).toLocaleDateString() :
                                            chat?.lastMessage?.createdAt ?
                                                new Date(chat.lastMessage.createdAt).toLocaleDateString() :
                                                'Now'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700 truncate max-w-[200px]">
                                        {typeof chat?.lastMessage === 'object'
                                            ? chat.lastMessage?.content || 'Media message'
                                            : chat?.lastMessage || 'Start a conversation...'
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