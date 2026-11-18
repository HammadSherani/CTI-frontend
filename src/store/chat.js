// store/chat.js — chat list, messages, unread counts, presence and typing (real-time)
import { createSlice } from '@reduxjs/toolkit';

const loadAuthState = () => {
    try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth || !auth.user) {
            return null;
        }
        return auth;
    } catch (error) {
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
    onlineUsers: [],          // user ids (strings) that are online right now
    lastSeen: {},             // userId -> ISO date they went offline
    typing: {},               // chatId -> true while the other person is typing
    unreadCounts: authUser?.unreadCounts || {},
    totalUnreadCount: 0,
};

// ---- helpers -------------------------------------------------------------

const sameChat = (c, chatId) => String(c.id) === String(chatId) || String(c.chatId) === String(chatId);
const findChatIndex = (state, chatId) => state.chats.findIndex((c) => sameChat(c, chatId));

// A message can be known by its database _id, its socket messageId, or (before it is saved)
// the clientId the sender's app gave it. Any match = same message.
const messageKeys = (m) => [m?._id, m?.messageId, m?.clientId, m?.id].filter(Boolean).map(String);
const findMessageIndex = (list, message) => {
    const keys = new Set(messageKeys(message));
    if (keys.size === 0) return -1;
    return list.findIndex((m) => messageKeys(m).some((k) => keys.has(k)));
};

const previewOf = (message) => ({
    content: message.messageType === 'text' || message.messageType === 'mixed'
        ? (message.content || message.text || '')
        : message.messageType === 'quotation'
            ? (message.content || 'Quotation')
            : `${message.messageType || 'Media'} message`,
    senderType: message.senderType,
    timestamp: message.timestamp || new Date().toISOString(),
    messageType: message.messageType || 'text',
});

const moveChatToTop = (state, index) => {
    if (index > 0) {
        const [chat] = state.chats.splice(index, 1);
        state.chats.unshift(chat);
    }
};

const isViewingChat = (state, chatId) =>
    state.isOpen && state.selectedChat && String(state.selectedChat.id) === String(chatId);

// ---- slice ---------------------------------------------------------------

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentUser: (state) => {
            const auth = loadAuthState();
            state.currentUser = auth;

            if (auth) {
                state.chats = auth.chats || [];
                state.messages = auth.messages || {};
                state.unreadCounts = auth.unreadCounts || {};
            } else {
                state.chats = [];
                state.messages = {};
                state.unreadCounts = {};
                state.isOpen = false;
                state.selectedChat = null;
                state.inputText = '';
                state.selectedFiles = [];
                state.onlineUsers = [];
                state.typing = {};
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
            state.unreadCounts[action.payload.id] = 0;
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

        // Fresh page of messages from the API. Keeps local messages the server doesn't know yet
        // (still sending / failed) and anything that arrived live while the request was running.
        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            const server = messages || [];
            const existing = state.messages[chatId] || [];
            const lastServerTime = server.length
                ? new Date(server[server.length - 1].timestamp || server[server.length - 1].createdAt).getTime()
                : 0;
            const extras = existing.filter((m) => {
                if (findMessageIndex(server, m) !== -1) return false;
                if (m.status === 'sending' || m.status === 'failed') return true;
                return new Date(m.timestamp || m.createdAt).getTime() > lastServerTime;
            });
            state.messages[chatId] = [...server, ...extras];
        },

        // New message (live from the socket, or our own optimistic one). If we already have it
        // (same _id / messageId / clientId) it is updated in place, e.g. "sending" -> "sent".
        addMessage: (state, action) => {
            const { chatId, message } = action.payload;
            if (!state.messages[chatId]) state.messages[chatId] = [];
            const list = state.messages[chatId];

            const index = findMessageIndex(list, message);
            if (index !== -1) {
                const current = list[index];
                list[index] = {
                    ...current,
                    ...message,
                    id: current.id || message._id || message.messageId,
                    // never go back from "read" to unread because a late copy arrived
                    isRead: current.isRead || message.isRead || false,
                    deliveredAt: current.deliveredAt || message.deliveredAt || null,
                    status: message.status || (current.status === 'failed' ? 'failed' : 'sent'),
                };
                return;
            }

            list.push({
                ...message,
                id: message._id || message.messageId || message.clientId || `${Date.now()}_${Math.random()}`,
                timestamp: message.timestamp || new Date().toISOString(),
            });

            const chatIndex = findChatIndex(state, chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = previewOf(message);
                moveChatToTop(state, chatIndex);
            } else {
                // Chat not in the list yet (first message of a new chat): show it right away
                state.chats.unshift({
                    id: chatId,
                    chatId,
                    lastMessage: previewOf(message),
                    otherUser: {
                        _id: message.user?._id || message.senderId,
                        name: message.user?.name || message.senderName || 'User',
                        avatar: message.user?.avatar || message.senderAvatar || null,
                        role: message.user?.role || message.senderType || 'customer',
                    },
                });
            }
        },

        // Our message could not be delivered (no ack / server error)
        setMessageStatus: (state, action) => {
            const { chatId, clientId, status } = action.payload;
            const list = state.messages[chatId] || [];
            const index = findMessageIndex(list, { clientId });
            if (index !== -1) list[index].status = status;
        },

        // Patch one of our local messages (e.g. upload progress)
        updateMessage: (state, action) => {
            const { chatId, clientId, changes } = action.payload;
            const list = state.messages[chatId] || [];
            const index = findMessageIndex(list, { clientId });
            if (index !== -1) Object.assign(list[index], changes);
        },

        // WhatsApp-style delete. scope "me": gone from my list; "everyone": shows "This message was deleted"
        deleteMessageLocal: (state, action) => {
            const { chatId, messageId, scope } = action.payload;
            const list = state.messages[chatId] || [];
            const index = findMessageIndex(list, { messageId, _id: messageId, clientId: messageId });
            if (index === -1) return;
            const wasLast = index === list.length - 1;

            if (scope === 'me') {
                list.splice(index, 1);
            } else {
                Object.assign(list[index], {
                    deletedForEveryone: true,
                    content: '',
                    mediaUrl: undefined,
                    localUrl: undefined,
                    thumbnailUrl: undefined,
                    blurDataUrl: undefined,
                    mediaKind: undefined,
                    fileName: undefined,
                    replyTo: undefined,
                    contactMasked: false,
                });
                // Replies that quoted it now quote "deleted"
                list.forEach((m) => {
                    if (m.replyTo && String(m.replyTo.messageId) === String(messageId)) {
                        m.replyTo = { ...m.replyTo, content: '🚫 This message was deleted', mediaUrl: undefined, messageType: 'text' };
                    }
                });
            }

            // Keep the chat-list preview in step when the newest message changed
            if (wasLast) {
                const chatIndex = findChatIndex(state, chatId);
                const newest = list[list.length - 1];
                if (chatIndex !== -1) {
                    state.chats[chatIndex].lastMessage = newest
                        ? (newest.deletedForEveryone
                            ? { content: '🚫 This message was deleted', senderType: newest.senderType, timestamp: newest.timestamp, messageType: 'text' }
                            : previewOf(newest))
                        : null;
                }
            }
        },

        // Our messages reached the other person's device: grey double tick
        messagesDeliveredToOther: (state, action) => {
            const { chatId, myId, deliveredAt } = action.payload;
            const at = deliveredAt || new Date().toISOString();
            (state.messages[chatId] || []).forEach((m) => {
                const sender = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
                const mine = String(sender) === String(myId);
                // only saved messages can be delivered (not "sending"/"failed" bubbles)
                if (mine && !m.deliveredAt && m.status !== 'sending' && m.status !== 'failed') m.deliveredAt = at;
            });
        },

        // The other person read the chat: our messages get "read" ticks
        messagesReadByOther: (state, action) => {
            const { chatId, myId } = action.payload;
            (state.messages[chatId] || []).forEach((m) => {
                const sender = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
                if (String(sender) === String(myId) && m.status !== 'sending' && m.status !== 'failed') {
                    m.isRead = true;
                    if (!m.deliveredAt) m.deliveredAt = new Date().toISOString(); // seen implies delivered
                }
            });
        },

        setTyping: (state, action) => {
            const { chatId, isTyping } = action.payload;
            if (isTyping) state.typing[chatId] = true;
            else delete state.typing[chatId];
        },

        // Kept for older callers: plain local echo of a message we sent
        sendMessage: (state, action) => {
            const { content, chatId } = action.payload;
            if (!state.messages[chatId]) state.messages[chatId] = [];
            state.messages[chatId].push({
                ...content,
                sender: 'user',
                chatId,
                id: Date.now(),
                timestamp: new Date().toISOString(),
            });
            const chatIndex = findChatIndex(state, chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = previewOf({ ...content, messageType: content.messageType || 'text' });
                moveChatToTop(state, chatIndex);
            }
            state.inputText = '';
            state.selectedFiles = [];
        },

        addChat: (state, action) => {
            const chat = action.payload;
            if (!state.chats.find((c) => sameChat(c, chat.id))) {
                state.chats.unshift(chat);
                if (!state.messages[chat.id]) state.messages[chat.id] = [];
                if (!state.unreadCounts[chat.id]) state.unreadCounts[chat.id] = 0;
            }
        },

        removeChat: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.filter((chat) => !sameChat(chat, chatId));
            delete state.messages[chatId];
            delete state.unreadCounts[chatId];
            if (state.selectedChat?.id === chatId) state.selectedChat = null;
        },

        setOnlineUsers: (state, action) => {
            state.onlineUsers = (action.payload || []).map((u) => String(u.userId || u));
        },

        setUserOnline: (state, action) => {
            const userId = String(action.payload?.userId || action.payload);
            if (!state.onlineUsers.includes(userId)) state.onlineUsers.push(userId);
            delete state.lastSeen[userId];
        },

        setUserOffline: (state, action) => {
            const userId = String(action.payload?.userId || action.payload);
            state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
            state.lastSeen[userId] = action.payload?.lastSeen || new Date().toISOString();
            Object.keys(state.typing).forEach((chatId) => {
                const chat = state.chats.find((c) => sameChat(c, chatId));
                if (String(chat?.otherUser?._id) === userId) delete state.typing[chatId];
            });
        },

        markChatAsRead: (state, action) => {
            state.unreadCounts[action.payload] = 0;
        },

        loadUserChats: (state, action) => {
            const { chats, messages, unreadCounts } = action.payload;
            state.chats = chats || [];

            // Keep cached messages; only overwrite chats the API actually sent messages for
            if (messages && Object.keys(messages).length > 0) {
                Object.keys(messages).forEach((chatId) => {
                    state.messages[chatId] = messages[chatId];
                });
            }

            state.unreadCounts = unreadCounts || {};

            // Presence that came with the list
            (chats || []).forEach((chat) => {
                const otherId = chat?.otherUser?._id && String(chat.otherUser._id);
                if (!otherId) return;
                if (chat.online && !state.onlineUsers.includes(otherId)) state.onlineUsers.push(otherId);
                if (!chat.online && chat.lastSeen && !state.lastSeen[otherId]) state.lastSeen[otherId] = chat.lastSeen;
            });
        },

        updateChatLastMessage: (state, action) => {
            const { chatId, lastMessage } = action.payload;
            const chatIndex = findChatIndex(state, chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = typeof lastMessage === 'object'
                    ? { ...lastMessage }
                    : lastMessage;
                moveChatToTop(state, chatIndex);
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
            state.totalUnreadCount = Object.values(state.unreadCounts).reduce((sum, count) => sum + count, 0);
        },

        // "chat_list_updated" from the server
        updateChatList: (state, action) => {
            const { type, chatId, lastMessage, unreadCountIncreased } = action.payload || {};
            if (!chatId) return;

            if (type === 'messages_read') {
                state.unreadCounts[chatId] = 0;
                return;
            }
            // newest message was deleted for everyone: new preview, same position in the list
            if (type === 'last_message_updated') {
                const i = findChatIndex(state, chatId);
                if (i !== -1) state.chats[i].lastMessage = lastMessage || null;
                return;
            }
            if (type && type !== 'new_message') return; // presence etc. is handled elsewhere

            const chatIndex = findChatIndex(state, chatId);
            if (chatIndex !== -1 && lastMessage) {
                state.chats[chatIndex].lastMessage = typeof lastMessage === 'object' ? { ...lastMessage } : lastMessage;
                moveChatToTop(state, chatIndex);
            }
            // Unread only counts when the person is not looking at this chat right now
            if (unreadCountIncreased && !isViewingChat(state, chatId)) {
                state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
            }
        },

        prependMessages: (state, action) => {
            const { chatId, messages: newMessages } = action.payload;
            if (!state.messages[chatId]) state.messages[chatId] = [];
            const existing = state.messages[chatId];
            const unique = (newMessages || []).filter((m) => findMessageIndex(existing, m) === -1);
            state.messages[chatId] = [...unique, ...existing];
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
    setSelectedFiles,
    clearSelectedFiles,
    setMessages,
    addMessage,
    setMessageStatus,
    updateMessage,
    deleteMessageLocal,
    messagesDeliveredToOther,
    messagesReadByOther,
    setTyping,
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
    updateTotalUnreadCount,
    updateChatList,
} = chatSlice.actions;

export default chatSlice.reducer;
