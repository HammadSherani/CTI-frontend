// store/chat.js - Updated onlineUsers and related functions
import { createSlice } from '@reduxjs/toolkit';

const loadAuthState = () => {
    try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth || !auth.user) {
            return null;
        }
        return auth;
    } catch (error) {
        console.error("Error parsing auth from localStorage:", error);
        return null;
    }
};

const authUser = loadAuthState();

const initialState = {
    currentUser: authUser,
    chats: authUser?.chats || [],
    messages: authUser?.messages || {},
    isOpen: false,
    selectedChat: null,
    inputText: '',
    selectedFiles: [],
    onlineUsers: [],
    unreadCounts: authUser?.unreadCounts || {},
    totalUnreadCount: 0,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            const authUser = loadAuthState();
            state.currentUser = authUser;

            if (authUser) {
                state.chats = authUser.chats || [];
                state.messages = authUser.messages || {};
                state.unreadCounts = authUser.unreadCounts || {};
            } else {
                state.chats = [];
                state.messages = {};
                state.unreadCounts = {};
                state.isOpen = false;
                state.selectedChat = null;
                state.inputText = '';
                state.selectedFiles = [];
                state.onlineUsers = [];
            }
        },

        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
            if (!state.isOpen) {
                state.selectedChat = null;
            }
        },

        openChat: (state) => {
            state.isOpen = true;
        },

        closeChat: (state) => {
            state.isOpen = false;
            state.selectedChat = null;
        },

        selectChat: (state, action) => {
            state.selectedChat = action.payload;
            const chatId = action.payload.id;
            state.unreadCounts[chatId] = 0;
        },

        backToInbox: (state) => {
            state.selectedChat = null;
        },

        setInputText: (state, action) => {
            state.inputText = action.payload;
        },

        setSelectedFiles: (state, action) => {
            state.selectedFiles = action.payload;
        },

        clearSelectedFiles: (state) => {
            state.selectedFiles = [];
        },

        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            state.messages[chatId] = messages;
        },

        addMessage: (state, action) => {
            const { chatId, message } = action.payload;

            const chatIndexById = state.chats.findIndex(c => c.id === chatId);
            const chatIndexByChatId = state.chats.findIndex(c => c.chatId === chatId);
            const chatIndex = chatIndexById !== -1 ? chatIndexById : chatIndexByChatId;

            if (!state.messages[chatId]) state.messages[chatId] = [];

            // Deduplication check to prevent duplicate messages
            const msgId = message._id || message.messageId;
            const isDuplicate = msgId && state.messages[chatId].some(
                m => (m._id && m._id === msgId) || (m.messageId && m.messageId === msgId)
            );
            if (isDuplicate) {
                return; // Message already exists, skip adding
            }

            state.messages[chatId].push({
                ...message,
                id: msgId || Date.now() + Math.random(),
                timestamp: message.timestamp || new Date().toISOString(),
            });

            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = message.text || message.content || "Media";
                state.chats[chatIndex].timestamp = new Date().toISOString();

                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            } else {
                // If chat is not in the list, create a placeholder so it appears in the inbox instantly
                const newChatPlaceholder = {
                    id: chatId,
                    chatId: chatId,
                    lastMessage: message.text || message.content || "Media",
                    timestamp: new Date().toISOString(),
                    otherUser: {
                        _id: message.user?._id || message.senderId,
                        name: message.user?.name || 'User',
                        avatar: message.user?.avatar || null,
                        role: message.user?.role || 'customer'
                    }
                };
                state.chats.unshift(newChatPlaceholder);
            }
        },

        sendMessage: (state, action) => {
            const { content, chatId } = action.payload;
            const chatIndex = state.chats.findIndex(c => c.id === chatId);

            const userMessage = {
                ...content,
                sender: 'user',
                chatId,
            };

            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }

            state.messages[chatId].push({
                ...userMessage,
                id: Date.now(),
                timestamp: new Date().toISOString(),
            });

            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = content.text || content.content || 'Media';
                state.chats[chatIndex].timestamp = new Date().toISOString();

                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            }

            state.inputText = '';
            state.selectedFile = null;
        },

        addChat: (state, action) => {
            const chat = action.payload;
            if (!state.chats.find(c => c.id === chat.id)) {
                state.chats.unshift(chat);
                if (!state.messages[chat.id]) {
                    state.messages[chat.id] = [];
                }
                if (!state.unreadCounts[chat.id]) {
                    state.unreadCounts[chat.id] = 0;
                }
            }
        },

        removeChat: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.filter(chat => chat.id !== chatId);
            delete state.messages[chatId];
            delete state.unreadCounts[chatId];

            if (state.selectedChat?.id === chatId) {
                state.selectedChat = null;
            }
        },

        setOnlineUsers: (state, action) => {
            const onlineUsersList = action.payload.map(u => u.userId);
            state.onlineUsers = onlineUsersList;

            state.chats.forEach(chat => {
                if (onlineUsersList.includes(chat.otherUser?._id)) {
                    chat.online = true;
                } else {
                    chat.online = false;
                }
            });

            if (state.selectedChat && onlineUsersList.includes(state.selectedChat.otherUser?._id)) {
                state.selectedChat.online = true;
            } else if (state.selectedChat) {
                state.selectedChat.online = false;
            }
        },

        setUserOnline: (state, action) => {
            const userId = action.payload;

            if (!state.onlineUsers.includes(userId)) {
                state.onlineUsers.push(userId);
            }

            state.chats.forEach(chat => {
                if (chat.otherUser?._id === userId || chat.otherUser === userId) {
                    chat.online = true;
                }
            });
            if (state.selectedChat?.otherUser?._id === userId) {
                state.selectedChat.online = true;
            }
        },

        setUserOffline: (state, action) => {
            const userId = action.payload;

            state.onlineUsers = state.onlineUsers.filter(id => id !== userId);

            state.chats.forEach(chat => {
                if (chat.otherUser?._id === userId || chat.otherUser === userId) {
                    chat.online = false;
                }
            });
            if (state.selectedChat?.otherUser?._id === userId) {
                state.selectedChat.online = false;
            }
        },

        markChatAsRead: (state, action) => {
            const chatId = action.payload;
            state.unreadCounts[chatId] = 0;
        },

        loadUserChats: (state, action) => {
            const { chats, messages, unreadCounts } = action.payload;
            state.chats = chats || [];

            // // OLD CODE — wiped all cached messages every time
            // state.messages = messages || {};

            // ✅ NEW CODE — Preserve cached messages, only add new ones
            if (messages && Object.keys(messages).length > 0) {
                // Only overwrite if API actually sent messages
                Object.keys(messages).forEach(chatId => {
                    state.messages[chatId] = messages[chatId];
                });
            }
            // If messages is {} or undefined, keep existing cached messages intact
            // ✅ END NEW CODE

            state.unreadCounts = unreadCounts || {};
        },

        updateChatLastMessage: (state, action) => {
            const { chatId, lastMessage } = action.payload;
            const chatIndex = state.chats.findIndex(c => c.id === chatId || c.chatId === chatId);

            if (chatIndex !== -1) {
                if (typeof lastMessage === 'object') {
                    state.chats[chatIndex].lastMessage = {
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        senderType: lastMessage.senderType,
                        messageType: lastMessage.messageType
                    };
                } else {
                    state.chats[chatIndex].lastMessage = lastMessage;
                }

                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            }
        },

        incrementUnreadCount: (state, action) => {
            const { chatId } = action.payload;
            state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
        },

        resetUnreadCount: (state, action) => {
            const { chatId } = action.payload;
            state.unreadCounts[chatId] = 0;
        },

        updateTotalUnreadCount: (state) => {
            const total = Object.values(state.unreadCounts).reduce((sum, count) => sum + count, 0);
            state.totalUnreadCount = total;
        },

        // ⭐ NEW ACTION - Handle chat_list_updated event
        updateChatList: (state, action) => {
            const { chatId, lastMessage, unreadCountIncreased } = action.payload;
            const chatIndex = state.chats.findIndex(c => c.id === chatId || c.chatId === chatId);

            if (chatIndex !== -1) {
                // Update last message
                if (typeof lastMessage === 'object') {
                    state.chats[chatIndex].lastMessage = {
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        senderType: lastMessage.senderType,
                        messageType: lastMessage.messageType
                    };
                } else {
                    state.chats[chatIndex].lastMessage = lastMessage;
                }

                // Increment unread count if needed
                if (unreadCountIncreased && state.selectedChat?.id !== chatId) {
                    state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
                }

                // Move chat to top
                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            }
        },

        prependMessages: (state, action) => {
            const { chatId, messages: newMessages } = action.payload;
            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }
            
            // Deduplicate to avoid React key issues and scroll jumps
            const existingIds = new Set(
                state.messages[chatId].map(m => m._id || m.messageId)
            );
            
            const uniqueNewMessages = newMessages.filter(
                m => !existingIds.has(m._id || m.messageId)
            );

            state.messages[chatId] = [...uniqueNewMessages, ...state.messages[chatId]];
        }
    },
});

export const {
    setCurrentUser,
    toggleChat,
    openChat,
    closeChat,
    selectChat,
    backToInbox,
    setInputText,
    setSelectedFiles,
    clearSelectedFiles,
    setMessages,
    addMessage,
    sendMessage,
    prependMessages,
    addChat,
    removeChat,
    setOnlineUsers,
    setUserOnline,
    setUserOffline,
    markChatAsRead,
    loadUserChats,
    updateChatLastMessage,
    incrementUnreadCount,
    resetUnreadCount,
    updateChatList, // ⭐ Export new action
} = chatSlice.actions;

export default chatSlice.reducer;