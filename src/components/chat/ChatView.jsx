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
    setSelectedFile
} from '@/store/chat';
import { useSocket } from '@/contexts/SocketProvider';
import QuotationForm from './QuotationForm';
import QuotationMessage from './QuotationMessage';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const ChatView = ({ chat, onBack }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showQuotationForm, setShowQuotationForm] = useState(false);

    const { token, user } = useSelector((state) => state.auth);
    const { messages, inputText, selectedFile, setInputText: updateInputText } = useChat();

    const {
        socket,
        connected,
        joinChat,
        leaveChat,
        sendMessage: socketSendMessage
    } = useSocket();

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

    const handleQuotationSuccess = useCallback((quotation) => {
        console.log('Quotation sent successfully:', quotation);
        // Optionally refresh messages to show the quotation
        fetchMessages();
    }, [fetchMessages]);

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

            if (connected && socket) {
                console.log('Using socket to send message');

                if (selectedFile) {
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
                    socketSendMessage(
                        chat.id,
                        inputText.trim(),
                        'text'
                    );
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

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    }, [handleSendMessage]);

    return (
        <>
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
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                                    title={connected ? 'Connected' : 'Disconnected'} />
                            </div>
                            <span className="text-xs text-gray-400">
                                {chat.online ? 'Online' : chat.username || 'Offline'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Quotation button - only show for repairman */}
                        {user?.role === 'repairman' && (
                            <Icon
                                icon="mdi:receipt"
                                width={20}
                                className="cursor-pointer hover:opacity-70 text-green-400"
                                onClick={() => setShowQuotationForm(true)}
                                title="Create Quotation"
                            />
                        )}
                        <Icon
                            icon="mdi:refresh"
                            width={20}
                            className="cursor-pointer hover:opacity-70"
                            onClick={fetchMessages}
                        />
                    </div>
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
                        chatMessages.map((message) => {
                            // Check if message is a quotation
                            if (message.messageType === 'quotation' || message.quotationData) {
                                return (
                                    <QuotationMessage
                                        key={message.id || message._id}
                                        message={message}
                                        isOwner={user.role === message.senderType}
                                    />
                                );
                            }

                            // Regular message rendering
                            return (
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
                                        {/* Media rendering */}
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

                                        {/* Message content */}
                                        {message.content || message.text ? (
                                            <p className="text-sm">{message.content || message.text}</p>
                                        ) : null}

                                        {/* Timestamp */}
                                        <span className="text-xs text-gray-400 mt-1 block">
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

            {/* Quotation Form Modal */}
            {showQuotationForm && (
                <QuotationForm
                    chatId={chat.id}
                    onClose={() => setShowQuotationForm(false)}
                    onSuccess={handleQuotationSuccess}
                />
            )}
        </>
    );
};

export default ChatView;