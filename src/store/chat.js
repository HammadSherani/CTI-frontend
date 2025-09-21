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
    selectedFile: null,
    onlineUsers: [], // Changed from Set to Array
    unreadCounts: authUser?.unreadCounts || {},
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
                state.selectedFile = null;
                state.onlineUsers = []; // Reset to empty array
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

        setSelectedFile: (state, action) => {
            state.selectedFile = action.payload;
        },

        clearSelectedFile: (state) => {
            state.selectedFile = null;
        },

        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            state.messages[chatId] = messages;
        },

        addMessage: (state, action) => {
    const { chatId, message } = action.payload;
    console.log('=== AddMessage Reducer Debug ===');
    console.log('Payload chatId:', chatId);
    console.log('Payload chatId type:', typeof chatId);
    console.log('Payload message:', message);
    console.log('Available chats:', state.chats.map(c => ({
        id: c.id, 
        chatId: c.chatId,
        idType: typeof c.id,
        chatIdType: typeof c.chatId
    })));
    
    // Try both id and chatId matching
    const chatIndexById = state.chats.findIndex(c => c.id === chatId);
    const chatIndexByChatId = state.chats.findIndex(c => c.chatId === chatId);
    
    console.log('Found chat by id index:', chatIndexById);
    console.log('Found chat by chatId index:', chatIndexByChatId);
    
    const chatIndex = chatIndexById !== -1 ? chatIndexById : chatIndexByChatId;
    console.log('Final chat index used:', chatIndex);
    
    if (chatIndex !== -1) {
        console.log('✅ Chat found! Adding message...');
        
        // Add message
        if (!state.messages[chatId]) state.messages[chatId] = [];
        state.messages[chatId].push({
            ...message,
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
        });

        console.log('Message added. Total messages now:', state.messages[chatId].length);

        // Update lastMessage
        state.chats[chatIndex].lastMessage = message.text || message.content || "Media";
        state.chats[chatIndex].timestamp = new Date().toISOString();

        // Reorder chat to top
        const [updatedChat] = state.chats.splice(chatIndex, 1);
        state.chats.unshift(updatedChat);

        // Update unread count if chat is not selected
        if (message.sender !== 'user' && state.selectedChat?.id !== chatId) {
            console.log('Incrementing unread count for chatId:', chatId);
            state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
        } else {
            console.log('Not incrementing unread - sender is user or chat is selected');
        }
    } else {
        console.log('❌ Chat NOT found for chatId:', chatId);
        console.log('Available chat IDs:', state.chats.map(c => c.id));
        console.log('Available chatIds:', state.chats.map(c => c.chatId));
    }
},

        sendMessage: (state, action) => {
            const { content, chatId } = action.payload;
            const chatIndex = state.chats.findIndex(c => c.id === chatId);

            // Add user message
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

            // Update last message in chat
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = content.text || content.content || 'Media';
                state.chats[chatIndex].timestamp = new Date().toISOString();

                // Move chat to top
                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            }

            // Clear input and file
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

        setUserOnline: (state, action) => {
            const userId = action.payload;

            // Add to online users array if not already present
            if (!state.onlineUsers.includes(userId)) {
                state.onlineUsers.push(userId);
            }

            // Update online status in chats
            state.chats.forEach(chat => {
                if (chat.userId === userId) {
                    chat.online = true;
                }
            });
        },

        setUserOffline: (state, action) => {
            const userId = action.payload;

            // Remove from online users array
            state.onlineUsers = state.onlineUsers.filter(id => id !== userId);

            // Update online status in chats
            state.chats.forEach(chat => {
                if (chat.userId === userId) {
                    chat.online = false;
                }
            });
        },

        markChatAsRead: (state, action) => {
            const chatId = action.payload;
            state.unreadCounts[chatId] = 0;
        },

        loadUserChats: (state, action) => {
            const { chats, messages, unreadCounts } = action.payload;
            state.chats = chats || [];
            state.messages = messages || {};
            state.unreadCounts = unreadCounts || {};
        },
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
    setSelectedFile,
    clearSelectedFile,
    setMessages,
    addMessage,
    sendMessage,
    addChat,
    removeChat,
    setUserOnline,
    setUserOffline,
    markChatAsRead,
    loadUserChats,
} = chatSlice.actions;

export default chatSlice.reducer;