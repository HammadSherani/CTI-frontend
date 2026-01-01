"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { useChat } from '@/hooks/useChat';
import { useDispatch, useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import {
    setMessages,
    clearSelectedFile,
    setSelectedFile,
    prependMessages
} from '@/store/chat';
import { useSocket } from '@/contexts/SocketProvider';
import QuotationForm from './QuotationForm';
import QuotationMessage from './QuotationMessage';

// Helper function to get file icon based on file type
const getFileIcon = (fileName, messageType) => {
    if (!fileName) return { icon: 'mdi:file', color: 'text-gray-500' };

    const ext = fileName.split('.').pop()?.toLowerCase();

    // Document files
    if (['pdf'].includes(ext)) return { icon: 'mdi:file-pdf-box', color: 'text-red-500' };
    if (['doc', 'docx'].includes(ext)) return { icon: 'mdi:file-word', color: 'text-blue-600' };
    if (['xls', 'xlsx'].includes(ext)) return { icon: 'mdi:file-excel', color: 'text-green-600' };
    if (['ppt', 'pptx'].includes(ext)) return { icon: 'mdi:file-powerpoint', color: 'text-orange-600' };
    if (['txt'].includes(ext)) return { icon: 'mdi:file-document', color: 'text-gray-600' };

    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: 'mdi:folder-zip', color: 'text-yellow-600' };

    // Video files
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(ext)) return { icon: 'mdi:video', color: 'text-purple-500' };

    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return { icon: 'mdi:music', color: 'text-pink-500' };

    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext)) {
        return { icon: 'mdi:code-braces', color: 'text-indigo-500' };
    }

    return { icon: 'mdi:file', color: 'text-gray-500' };
};

// Helper function to format file size
const formatFileSize = (url) => {
    return 'File';
};

// Helper function to get file name from URL
const getFileNameFromUrl = (url) => {
    if (!url) return 'Unknown File';
    try {
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        return decodeURIComponent(fileName);
    } catch {
        return 'File';
    }
};

// Message Skeleton Component
const MessageSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${i % 2 === 0 ? 'bg-primary-100' : 'bg-gray-200'
                    } animate-pulse`}>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
            </div>
        ))}
    </div>
);

const ChatView = ({ chat, onBack }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [showQuotationForm, setShowQuotationForm] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [oldestMessageId, setOldestMessageId] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    const { token, user } = useSelector((state) => state.auth);
    const { messages, inputText, selectedFile, setInputText: updateInputText, selectChat } = useChat();

    

    const {
        socket,
        connected,
        joinChat,
        leaveChat,
        sendMessage: socketSendMessage
    } = useSocket();

    const chatMessages = messages[chat.id] || [];

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

    const fetchMessages = useCallback(async (before = null) => {
        if (!token || !chat.id) return;
        if (before) setLoadingMore(true);

        try {
            const url = before
                ? `/chat/${chat.id}/messages?limit=20&before=${before}`
                : `/chat/${chat.id}/messages?limit=20`;

            const { data } = await axiosInstance.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (before) {
                dispatch(prependMessages({
                    chatId: chat.id,
                    messages: data.messages
                }));
            } else {
                dispatch(setMessages({
                    chatId: chat.id,
                    messages: data.messages || []
                }));
                // Initial load ke baad scroll down
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
                    }
                }, 100);
            }

            setHasMore(data.hasMore);
            setOldestMessageId(data.oldestMessageId);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            handleError(error);
        } finally {
            setLoadingMore(false);
            setInitialLoading(false);
        }
    }, [token, chat.id, dispatch]);

    useEffect(() => {
        setInitialLoading(true);
        fetchMessages();
    }, [chat.id]);


    useEffect(() => {
        if (messagesEndRef.current && !loadingMore && !initialLoading) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages.length, initialLoading, loadingMore]);

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || loadingMore || !hasMore) {
            return;
        }

        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop < 50 && oldestMessageId) {
            const previousScrollHeight = messagesContainerRef.current.scrollHeight;

            fetchMessages(oldestMessageId).then(() => {
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight;
                        messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
                    }
                });
            });
        }
    }, [loadingMore, hasMore, oldestMessageId, fetchMessages]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            dispatch(setSelectedFile(file));
        }
    }, [dispatch]);

    const handleQuotationSuccess = useCallback((quotation) => {
        console.log('Quotation sent successfully:', quotation);
        fetchMessages();
    }, [fetchMessages]);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && !selectedFile) || sending) return;

        setSending(true);

        try {
            if (connected && socket) {
                console.log('Using socket to send message');

                if (selectedFile) {
                    const formData = new FormData();
                    const trimmedText = inputText.trim();

                    formData.append('content', trimmedText);
                    formData.append('media', selectedFile);

                    let messageType;
                    if (trimmedText && selectedFile) {
                        messageType = 'mixed';
                    } else if (selectedFile.type.startsWith('image/')) {
                        messageType = 'image';
                    } else {
                        messageType = 'file';
                    }

                    formData.append('messageType', messageType);

                    await axiosInstance.post(`/chat/${chat.id}/send`, formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        },
                    });
                } else {
                    socketSendMessage(chat.id, inputText.trim(), 'text');
                }

            } else {
                console.log('Using HTTP API fallback');
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

    const handleModelClose = () => {
        setShowQuotationForm(false)
        console.log(`selectedParts_quotation_chat_${chat.id}`);
        
        localStorage.removeItem(`selectedParts_quotation_chat_${chat.id}`);
    }

    // console.log("chat.id" ,chat.id);
    
    

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    }, [handleSendMessage]);

    const handleFileClick = useCallback((mediaUrl) => {
        if (mediaUrl) {
            window.open(mediaUrl, '_blank');
        }
    }, []);




    return (
        <>
            <div className="flex flex-col w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200">
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
                                    <Icon icon="mdi:check-decagram" className="text-primary-500" width={16} />
                                )}
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                                    title={connected ? 'Connected' : 'Disconnected'} />
                            </div>
                            <span className="text-xs text-gray-400">
                                {chat.online ? 'Online' : chat.username || 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user?.role === 'repairman' && (
                            <p
                            onClick={() => setShowQuotationForm(true)}
                            className='text-sm cursor-pointer border py-1 px-2 rounded-sm'>Create Quote</p>
                        )}
                    </div>
                </div>

                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 bg-gray-50"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    {loadingMore && (
                        <div className="flex justify-center py-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        </div>
                    )}

                    {!loadingMore && hasMore && chatMessages.length > 0 && (
                        <div className="text-center py-2 text-xs text-gray-400">
                            Scroll up to load more
                        </div>
                    )}

                    {/* Initial Loading Skeleton */}
                    {initialLoading ? (
                        <MessageSkeleton />
                    ) : chatMessages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Icon icon="mdi:chat-outline" width={48} className="mx-auto mb-2 opacity-50" />
                            <p>Start your conversation with {chat.name || 'this user'}</p>
                        </div>
                    ) : (
                        chatMessages.map((message) => {
                            // Quotation messages
                            if (message.messageType === 'quotation' || message.quotationData) {
                                return (
                                    <QuotationMessage
                                        key={message.id || message._id}
                                        message={message}
                                        isOwner={user.role === message.senderType}
                                    />
                                );
                            }

                            const isOwner = user.role === message.senderType;

                            return (
                                <div
                                    key={message.id || message._id}
                                    className={`flex ${isOwner ? "justify-end" : "justify-start"} mb-2`}
                                >
                                    <div
                                        className={`max-w-[70%] p-2 rounded-lg ${isOwner
                                                ? "bg-primary-500 text-white"
                                                : "bg-gray-200 text-gray-800"
                                            }`}
                                    >
                                        {/* Image Messages */}
                                        {message?.messageType === 'image' && message?.mediaUrl && (
                                            <img
                                                src={message.mediaUrl}
                                                alt="Image"
                                                className="max-w-full h-auto rounded-md mb-1 cursor-pointer hover:opacity-90"
                                                onClick={() => handleFileClick(message.mediaUrl)}
                                            />
                                        )}

                                        {/* Mixed Messages (Image + Text) */}
                                        {message?.messageType === 'mixed' && message?.mediaUrl && (
                                            <img
                                                src={message.mediaUrl}
                                                alt="Image"
                                                className="max-w-full h-auto rounded-md mb-1 cursor-pointer hover:opacity-90"
                                                onClick={() => handleFileClick(message.mediaUrl)}
                                            />
                                        )}

                                        {/* File Messages */}
                                        {message?.messageType === 'file' && message?.mediaUrl && (
                                            <div
                                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:opacity-90 ${isOwner ? 'bg-primary-600' : 'bg-white'
                                                    }`}
                                                onClick={() => handleFileClick(message.mediaUrl)}
                                            >
                                                <div className="flex-shrink-0">
                                                    <Icon
                                                        icon={getFileIcon(getFileNameFromUrl(message.mediaUrl), message.messageType).icon}
                                                        width={32}
                                                        className={getFileIcon(getFileNameFromUrl(message.mediaUrl), message.messageType).color}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-medium truncate ${isOwner ? 'text-white' : 'text-gray-800'
                                                        }`}>
                                                        {getFileNameFromUrl(message.mediaUrl)}
                                                    </p>
                                                    <p className={`text-xs ${isOwner ? 'text-gray-200' : 'text-gray-500'
                                                        }`}>
                                                        {formatFileSize(message.mediaUrl)}
                                                    </p>
                                                </div>
                                                <Icon
                                                    icon="mdi:download"
                                                    width={20}
                                                    className={isOwner ? 'text-white' : 'text-gray-600'}
                                                />
                                            </div>
                                        )}

                                        {/* Text Content */}
                                        {(message.content || message.text) && (
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content || message.text}
                                            </p>
                                        )}

                                        {/* Timestamp */}
                                        <span className={`text-xs mt-1 block ${isOwner ? 'text-gray-200' : 'text-gray-500'
                                            }`}>
                                            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* File Preview */}
                {selectedFile && (
                    <div className="px-4 py-2 border-t bg-gray-50">
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                            <div className="flex items-center gap-2">
                                {selectedFile.type.startsWith('image/') ? (
                                    <Icon icon="mdi:image" width={20} className="text-primary-500" />
                                ) : selectedFile.type.startsWith('video/') ? (
                                    <Icon icon="mdi:video" width={20} className="text-purple-500" />
                                ) : (
                                    <Icon icon={getFileIcon(selectedFile.name).icon} width={20} className={getFileIcon(selectedFile.name).color} />
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
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        ) : (
                            <Icon
                                icon="mdi:send"
                                width={20}
                                className={`cursor-pointer transition-colors ${(inputText.trim() || selectedFile) ? "text-primary-500 hover:text-primary-600" : "text-gray-400"
                                    }`}
                                onClick={handleSendMessage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showQuotationForm && (
                <QuotationForm
                    chatId={chat.id}
                    onClose={handleModelClose}
                    onSuccess={handleQuotationSuccess}
                />
            )}
        </>
    );
};

export default ChatView;