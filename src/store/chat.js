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
  chats: authUser?.chats || {},
  messages: authUser?.messages || {},
  isOpen: false,
  selectedChat: null,
  inputText: '',
  selectedFile: null,
  onlineUsers: new Set(),
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
        state.chats = authUser.chats || {};
        state.messages = authUser.messages || {};
        state.unreadCounts = authUser.unreadCounts || {};
      } else {
        state.chats = {};
        state.messages = {};
        state.unreadCounts = {};
        state.isOpen = false;
        state.selectedChat = null;
        state.inputText = '';
        state.selectedFile = null;
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

        addMessage: (state, action) => {
            const { chatId, message } = action.payload;

            if (!state.messages[chatId]) {
                state.messages[chatId] = [];
            }

            state.messages[chatId].push({
                ...message,
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
            });

            if (state.chats[chatId]) {
                state.chats[chatId].lastMessage = message.text || 'Media';
                state.chats[chatId].timestamp = new Date().toLocaleDateString();
            }

            if (message.sender !== 'user' && state.selectedChat?.id !== chatId) {
                state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
            }
        },

        sendMessage: (state, action) => {
            const { content, chatId } = action.payload;

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
            if (state.chats[chatId]) {
                state.chats[chatId].lastMessage = content.text || 'Media';
                state.chats[chatId].timestamp = 'now';
            }

            // Clear input and file
            state.inputText = '';
            state.selectedFile = null;
        },

        addChat: (state, action) => {
            const chat = action.payload;
            state.chats[chat.id] = chat;
            if (!state.messages[chat.id]) {
                state.messages[chat.id] = [];
            }
            if (!state.unreadCounts[chat.id]) {
                state.unreadCounts[chat.id] = 0;
            }
        },

        removeChat: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
            delete state.messages[chatId];
            delete state.unreadCounts[chatId];

            if (state.selectedChat?.id === chatId) {
                state.selectedChat = null;
            }
        },

        setUserOnline: (state, action) => {
            const userId = action.payload;
            state.onlineUsers.add(userId);

            // Update online status in chats
            Object.values(state.chats).forEach(chat => {
                if (chat.userId === userId) {
                    chat.online = true;
                }
            });
        },

        setUserOffline: (state, action) => {
            const userId = action.payload;
            state.onlineUsers.delete(userId);

            // Update online status in chats
            Object.values(state.chats).forEach(chat => {
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
            state.chats = chats || {};
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