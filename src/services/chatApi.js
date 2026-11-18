// Loads the chat list (previews, unread counts, who is online) into the store.
// Used on page load / socket (re)connect, and by the inbox refresh button.
import axiosInstance from '@/config/axiosInstance';
import { loadUserChats, setMessages } from '@/store/chat';

export async function fetchChatListInto(dispatch, token) {
    if (!token) return null;
    const { data } = await axiosInstance.get('/chat/list', {
        headers: { Authorization: `Bearer ${token}` },
    });
    const chats = (data?.chats || []).map((chat) => ({ ...chat, id: chat.chatId }));
    const unreadCounts = {};
    chats.forEach((chat) => {
        if (chat.unreadCount > 0) unreadCounts[chat.chatId] = chat.unreadCount;
    });
    dispatch(loadUserChats({ chats, unreadCounts }));
    return chats;
}

// Load a chat's latest messages in the background so opening it is instant.
// markRead=false: prefetching must not tell the other person "read" before the chat is opened.
const inFlight = new Set();
export async function prefetchChatMessages(dispatch, getState, token, chatId) {
    if (!token || !chatId) return;
    const key = String(chatId);
    if (inFlight.has(key) || getState().chat.messages[key]?.length) return;
    inFlight.add(key);
    try {
        const { data } = await axiosInstance.get(`/chat/${key}/messages`, {
            params: { limit: 20, markRead: false },
            headers: { Authorization: `Bearer ${token}` },
        });
        // Opened meanwhile? ChatView already loaded it; don't overwrite
        if (data?.success && !getState().chat.messages[key]?.length) {
            dispatch(setMessages({ chatId: key, messages: (data.messages || []).map((m) => ({ ...m, status: 'sent' })) }));
        }
    } catch {
        // background only
    } finally {
        inFlight.delete(key);
    }
}
