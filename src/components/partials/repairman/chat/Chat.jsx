"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { useChat } from '../../../../hooks/useChat';
import { useDispatch, useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { loadUserChats, setMessages, addMessage, setInputText, clearSelectedFile, setSelectedFile } from '../../../../store/chat';
import { useSocket } from '@/contexts/SocketProvider';

const MessageBar = React.memo(({ onClick, unreadCount }) => (
    <div
        onClick={onClick}
        className="w-[360px] h-12 bg-[#0E1014] text-white flex items-center justify-between px-4 rounded-t-md shadow-md cursor-pointer relative"
    >
        <span className="text-sm font-medium">Messages</span>
        <div className="flex items-center gap-4">
            <div className="relative">
                <Icon icon="mdi:bell-outline" width="20" height="20" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            <Icon icon="mdi:chevron-up" width="20" height="20" />
        </div>
    </div>
));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const ChatInbox = ({ onSelectChat, onClose }) => {
    const { unreadCounts, chats } = useChat();
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ChatInbox component mein fetchChatList ke baad add karo:
const fetchChatList = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
        const { data } = await axiosInstance.get("/chat/list", {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Raw chat data from API:', data.chats);
        
        // Fix: Ensure each chat has proper id field
        const processedChats = (data.chats || []).map(chat => {
            console.log('Processing individual chat:', chat);
            return {
                ...chat,
                id: chat.chatId // Map chatId to id for Redux compatibility
            };
        });
        
        console.log('Processed chats:', processedChats);
        
        dispatch(loadUserChats({
            chats: processedChats,
            messages: {},
            unreadCounts: {}
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

useEffect(() => {
    if (chats && chats.length > 0) {
        console.log('Chat object structure:', JSON.stringify(chats[0], null, 2));
        console.log('Chat IDs available:', chats.map(c => ({ id: c.id, chatId: c.chatId })));
    }
}, [chats]);
    const filteredChats = chats?.filter(chat =>
        chat?.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // ChatInbox component mein handleChatSelect function update karo:

const handleChatSelect = useCallback((chat) => {
    console.log('Selected chat object:', chat); // Debug log
    console.log('Chat ID:', chat.chatId); // Debug log
    
    onSelectChat({
        id: chat.chatId, // Ye important change hai - chat.chatId use kar rahe hain
        chatId: chat.chatId, // Backend ke liye
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
                    <Icon
                        icon="mdi:refresh"
                        width={20}
                        className="cursor-pointer hover:opacity-70"
                        onClick={fetchChatList}
                    />
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
                <span className="text-blue-500 cursor-pointer">Requests</span>
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
                                className="text-blue-500 text-sm mt-2 hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat?._id}
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
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat?.online ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
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
                                            <Icon icon="mdi:check-decagram" className="text-blue-500" width={16} />
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {chat?.lastMessage?.createdAt ?
                                            new Date(chat.lastMessage.createdAt).toLocaleDateString() :
                                            'Now'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700 truncate max-w-[200px]">
                                        {chat?.lastMessage?.content || 'Start a conversation...'}
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

const ChatView = ({ chat, onBack }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const { token, user } = useSelector((state) => state.auth);
    const { messages, inputText, selectedFile, setInputText: updateInputText } = useChat();
    
    // ADD SOCKET INTEGRATION - Import useSocket hook
    const { 
        socket, 
        connected, 
        joinChat, 
        leaveChat, 
        sendMessage: socketSendMessage 
    } = useSocket();
    
    // Add useSocket import at top of file
    // import { useSocket } from '@/contexts/SocketProvider';

    const chatMessages = messages[chat.id] || [];

    // Auto-join chat when selected
    useEffect(() => {
        if (chat.id && connected) {
            console.log('Auto-joining chat:', chat.id);
            joinChat(chat.id);
            
            return () => {
                console.log('Auto-leaving chat:', chat.id);
                leaveChat(chat.id);
            };
        }
    }, [chat.id, connected, joinChat, leaveChat]);

    const fetchMessages = useCallback(async () => {
        if (!token || !chat.id) return;

        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/chat/${chat.id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(setMessages({ chatId: chat.id, messages: data.messages || [] }));
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [token, chat.id, dispatch]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            dispatch(setSelectedFile(file));
        }
    }, [dispatch]);

    // UPDATED SEND MESSAGE WITH SOCKET
    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && !selectedFile) || sending) return;

        setSending(true);

        try {
            console.log('=== Send Message Debug ===');
            console.log('Connected:', connected);
            console.log('Socket exists:', !!socket);
            console.log('Chat ID:', chat.id);
            console.log('Will use socket:', !!(connected && socket));

            // If socket connected, use socket
            if (connected && socket) {
                console.log('Using socket to send message');
                
                if (selectedFile) {
                    // Handle file upload first, then send via socket
                    const formData = new FormData();
                    formData.append('content', inputText.trim());
                    formData.append('media', selectedFile);
                    formData.append('messageType', selectedFile.type.startsWith('image/') ? 'image' : 'file');

                    await axiosInstance.post(`/chat/${chat.id}/send`, formData, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        },
                    });
                } else {
                    // Send text message via socket
                    socketSendMessage(
                        chat.id,
                        inputText.trim(),
                        'text'
                    );
                }
            } else {
                console.log('Using HTTP API fallback');
                // Fallback to HTTP API
                const messageData = {
                    content: inputText.trim(),
                    messageType: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
                };

                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('content', messageData.content);
                    formData.append('media', selectedFile);
                    formData.append('messageType', messageData.messageType);

                    await axiosInstance.post(`/chat/${chat.id}/send`, formData, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        },
                    });
                } else {
                    await axiosInstance.post(`/chat/${chat.id}/send`, messageData, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            }

            // Clear input
            updateInputText("");
            dispatch(clearSelectedFile());
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
        } catch (error) {
            console.error("Error sending message:", error);
            handleError(error);
        } finally {
            setSending(false);
        }
    }, [inputText, selectedFile, sending, chat.id, connected, socket, socketSendMessage, updateInputText, dispatch, token]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    }, [handleSendMessage]);

    console.log('=== Messages Debug ===');
    console.log('Messages for current chat:', messages[chat.id]);
    console.log('All message keys:', Object.keys(messages));
    console.log('Chat ID we are looking for:', chat.id);
    console.log('Socket connected:', connected);

    return (
        <div className="flex flex-col w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon icon="mdi:arrow-left" width={20} onClick={onBack} className="cursor-pointer hover:opacity-70" />
                    <img
                        src={chat.avatar || 'https://i.pravatar.cc/100?img=1'}
                        alt={chat.name}
                        className="w-8 h-8 rounded-md object-cover"
                        onError={(e) => {
                            e.target.src = 'https://i.pravatar.cc/100?img=1';
                        }}
                    />
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">{chat.name || 'Unknown User'}</span>
                            {chat.verified && (
                                <Icon icon="mdi:check-decagram" className="text-blue-500" width={16} />
                            )}
                            {/* Socket connection indicator */}
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} 
                                 title={connected ? 'Connected' : 'Disconnected'} />
                        </div>
                        <span className="text-xs text-gray-400">
                            {chat.online ? 'Online' : chat.username || 'Offline'}
                        </span>
                    </div>
                </div>
                <Icon
                    icon="mdi:refresh"
                    width={20}
                    className="cursor-pointer hover:opacity-70"
                    onClick={fetchMessages}
                />
            </div>

            {/* Messages */}
            <div 
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
                style={{ overscrollBehavior: 'contain' }}
            >
                {loading ? (
                    <LoadingSpinner />
                ) : chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Icon icon="mdi:chat-outline" width={48} className="mx-auto mb-2 opacity-50" />
                        <p>Start your conversation with {chat.name || 'this user'}</p>
                    </div>
                ) : (
                    chatMessages.map((message) => (
                        <div
                            key={message.id || message._id}
                            className={`flex ${user.role === message.senderType ? "justify-end" : "justify-start"} mb-2`}
                        >
                            <div
                                className={`max-w-[70%] p-2 rounded-lg ${user.role === message.senderType
                                        ? "bg-blue-500 text-white"  
                                        : "bg-gray-200 text-gray-800" 
                                    }`}
                            >
                                {message.media && (
                                    <>
                                        {message.media.type === 'image' && (
                                            <img
                                                src={message.media.url}
                                                alt={message.media.name}
                                                className="max-w-full h-auto rounded-md mb-1"
                                            />
                                        )}
                                        {message.media.type === 'video' && (
                                            <video
                                                src={message.media.url}
                                                controls
                                                className="max-w-full h-auto rounded-md mb-1"
                                            />
                                        )}
                                        {message.media.type === 'file' && (
                                            <a
                                                href={message.media.url}
                                                download={message.media.name}
                                                className="text-blue-500 underline block mb-1"
                                            >
                                                📎 {message.media.name}
                                            </a>
                                        )}
                                    </>
                                )}
                                {message.content || message.text ? (
                                    <p className="text-sm">{message.content || message.text}</p>
                                ) : null}
                                <span className="text-xs text-gray-400 mt-1 block">
                                    {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFile && (
                <div className="px-4 py-2 border-t bg-gray-50">
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                            {selectedFile.type.startsWith('image/') ? (
                                <Icon icon="mdi:image" width={20} className="text-blue-500" />
                            ) : selectedFile.type.startsWith('video/') ? (
                                <Icon icon="mdi:video" width={20} className="text-purple-500" />
                            ) : (
                                <Icon icon="mdi:file" width={20} className="text-gray-500" />
                            )}
                            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                        </div>
                        <Icon
                            icon="mdi:close"
                            width={16}
                            className="text-gray-500 cursor-pointer hover:text-red-500"
                            onClick={() => dispatch(clearSelectedFile())}
                        />
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2">
                    <Icon
                        icon="mdi:paperclip"
                        width={20}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*,*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => updateInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 bg-transparent outline-none disabled:opacity-50"
                    />
                    {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    ) : (
                        <Icon
                            icon="mdi:send"
                            width={20}
                            className={`cursor-pointer transition-colors ${(inputText.trim() || selectedFile) ? "text-blue-500 hover:text-blue-600" : "text-gray-400"
                                }`}
                            onClick={handleSendMessage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

function GlobalChat() {
    const {
        isOpen,
        selectedChat,
        unreadCounts,
        hasUser,
        toggleChat,
        closeChat,
        selectChat,
        backToInbox,
    } = useChat();

    if (!hasUser) {
        return null;
    }

    const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
        <div className="fixed bottom-0 right-0 z-50">
            {isOpen ? (
                selectedChat ? (
                    <ChatView
                        chat={selectedChat}
                        onBack={backToInbox}
                    />
                ) : (
                    <ChatInbox
                        onSelectChat={selectChat}
                        onClose={closeChat}
                    />
                )
            ) : (
                <MessageBar
                    onClick={toggleChat}
                    unreadCount={totalUnreadCount}
                />
            )}
        </div>
    );
}

export const ChatButton = ({ className = "" }) => {
    const { openChat, unreadCounts, hasUser } = useChat();

    if (!hasUser) {
        return null;
    }

    const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return (
        <button
            onClick={openChat}
            className={`relative p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors ${className}`}
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

export default GlobalChat;