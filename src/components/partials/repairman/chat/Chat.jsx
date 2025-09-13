'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';


const chatData = [
    {
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },
    {
        id: 2,
        name: "Nicholas F.",
        username: "@FLNicholas",
        verified: true,
        lastMessage: "Hi Hammad! I'm here to assist you with Fr...",
        timestamp: "Mar 7",
        unreadCount: 0,
        online: false,
        avatar: "https://i.pravatar.cc/100?img=2"
    },

    {
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },
    {
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },{
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },{
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },{
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },{
        id: 1,
        name: "Frank F.",
        username: "@FLFrank",
        verified: true,
        lastMessage: "Hey, just checking in! I hope you’re doing well.",
        timestamp: "Thu",
        unreadCount: 3,
        online: true,
        avatar: "https://i.pravatar.cc/100?img=1"
    },
];


const MessageBar = React.memo(({ onClick }) => (
    <div
        onClick={onClick}
        className="w-[360px] h-12 bg-[#0E1014] text-white flex items-center justify-between px-4 rounded-t-md shadow-md cursor-pointer"
    >
        <span className="text-sm font-medium">Messages</span>
        <div className="flex items-center gap-4">
            <Icon icon="mdi:bell-outline" width="20" height="20" />
            <Icon icon="mdi:chevron-up" width="20" height="20" />
        </div>
    </div>
));


const ChatInbox = ({ onClose }) => {
    return (
        <div className="w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 h-[500px]">
            {/* Header */}
            <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="flex gap-4 items-center">
                    <Icon icon="mdi:bell-outline" width={20} />
                    <Icon icon="mdi:chevron-down" width={20} onClick={onClose} className="cursor-pointer" />
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center px-4 py-3 border-b">
                <div className="flex items-center bg-gray-100 rounded-full w-full px-3 py-1.5">
                    <Icon icon="mdi:magnify" className="text-gray-500" width={20} />
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent ml-2 outline-none w-full"
                    />
                </div>
                <Icon icon="mdi:tune-variant" width={24} className="ml-2 text-pink-500" />
            </div>

            {/* Tabs */}
            <div className="flex justify-between items-center px-4 py-2 text-sm font-semibold">
                <span>Chats</span>
                <span className="text-blue-500 cursor-pointer">Requests</span>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto max-h-[400px]">
                {chatData.map((chat) => (
                    <div key={chat.id} className="flex items-start px-4 py-3 hover:bg-gray-50 cursor-pointer relative">
                        <div className="relative">
                            <img
                                src={chat.avatar}
                                alt={chat.name}
                                className="w-12 h-12 rounded-md object-cover"
                            />
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.online ? "bg-green-500" : "bg-gray-400"
                                    }`}
                            />
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-sm">{chat.name}</span>
                                    <span className="text-sm text-gray-500">{chat.username}</span>
                                    {chat.verified && (
                                        <Icon icon="mdi:check-decagram" className="text-blue-500" width={16} />
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">{chat.timestamp}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-700 truncate max-w-[200px]">{chat.lastMessage}</p>
                                {chat.unreadCount > 0 && (
                                    <span className="text-xs bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center ml-2">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! How can I help you today?', sender: 'bot', timestamp: new Date() },
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback((e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const timestamp = new Date();
        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');

        setTimeout(() => {
            const botMessage = {
                id: Date.now() + 1,
                text: 'Thanks for your message! This is a simulated response.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    }, [inputText]);

    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fixed bottom-0 right-0 z-50">
            {isOpen ? (
                <ChatInbox onClose={() => setIsOpen(false)} />
            ) : (
                <MessageBar onClick={() => setIsOpen(true)} />
            )}
        </div>
    );
}

export default Chat;
