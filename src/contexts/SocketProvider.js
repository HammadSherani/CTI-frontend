// contexts/SocketProvider.js — one socket per logged-in user; feeds chat + notifications into Redux
'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch, useStore } from 'react-redux';
import {
  addMessage,
  setUserOnline,
  setUserOffline,
  markChatAsRead,
  updateChatList,
  setCurrentUser,
  setOnlineUsers,
  messagesReadByOther,
  messagesDeliveredToOther,
  deleteMessageLocal,
  updateQuotation,
  setTyping,
} from '../store/chat';
import { addNotification } from '@/store/notifications';
import { fetchChatListInto } from '@/services/chatApi';

const SocketContext = createContext();

const ACK_TIMEOUT_MS = 10000;
const TYPING_CLEAR_MS = 5000;

// Short, soft two-tone "pop" made with WebAudio (no sound file to download).
// Browsers only allow sound after the user has interacted with the page; otherwise this is silent.
let audioCtx = null;
let lastSoundAt = 0;
function playMessageSound() {
  try {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('chatSound') === 'off') return;
    const now = Date.now();
    if (now - lastSoundAt < 1500) return; // a burst of messages = one sound
    lastSoundAt = now;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    const t = audioCtx.currentTime;
    [[880, 0], [1320, 0.09]].forEach(([freq, delay]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.12, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.18);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  } catch {
    // sound is optional
  }
}

// Socket payload -> message shape used by the chat UI
const toMessage = (m) => ({
  _id: m._id || m.messageId,
  messageId: m.messageId,
  clientId: m.clientId || undefined,
  content: m.content,
  messageType: m.messageType,
  senderType: m.senderType,
  senderId: m.senderId,
  timestamp: m.timestamp,
  mediaUrl: m.mediaUrl,
  fileName: m.fileName,
  fileSize: m.fileSize,
  quotationId: m.quotationId,
  quotationData: m.quotationData,
  mimeType: m.mimeType,
  thumbnailUrl: m.thumbnailUrl,
  blurDataUrl: m.blurDataUrl,
  width: m.width,
  height: m.height,
  duration: m.duration,
  replyTo: m.replyTo || undefined,
  contactMasked: !!m.contactMasked,
  deliveredAt: m.deliveredAt || null,
  isRead: !!m.isRead,
  status: 'sent',
  user: {
    _id: m.senderId,
    name: m.senderName,
    avatar: m.senderAvatar,
    role: m.senderType,
  },
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  // Login returns the id as `id`, other flows as `_id`
  const userId = (user?._id || user?.id) ? String(user._id || user.id) : null;
  const dispatch = useDispatch();
  const store = useStore();
  const typingTimers = useRef({});

  // The chat that is open and visible right now (if any)
  const viewedChatId = useCallback(() => {
    const { isOpen, selectedChat } = store.getState().chat;
    if (!isOpen || !selectedChat?.id) return null;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return null;
    return String(selectedChat.id);
  }, [store]);

  useEffect(() => {
    // Ensure chat slice knows about the authenticated user on load
    if (user) {
      try {
        dispatch(setCurrentUser(user));
      } catch (err) {
        console.error('Failed to set chat current user:', err);
      }
    }

    // Same backend as the REST API unless a separate socket URL is configured
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiOrigin || 'http://localhost:8000';
    const newSocket = io(socketUrl, {
      auth: token ? { token } : {},
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // keep trying (e.g. laptop wakes up, wifi comes back)
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    const markReadIfViewing = (chatId) => {
      if (viewedChatId() === String(chatId)) {
        newSocket.emit('mark_messages_read', { chatId });
        dispatch(markChatAsRead(chatId));
      }
    };

    newSocket.on('connect', () => {
      setConnected(true);
      if (!token) return;
      newSocket.emit('user_online');
      newSocket.emit('get_online_users');
      // (Re)connected: refresh previews + unread counts so nothing missed while offline is lost
      fetchChatListInto(dispatch, token).catch(() => {});
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('push_notification', (data) => {
      dispatch(addNotification(data));
    });

    newSocket.on('new_message', (data) => {
      if (!data?.chatId) return;
      const chatId = String(data.chatId);
      dispatch(addMessage({ chatId, message: toMessage(data) }));

      const fromOther = String(data.senderId) !== userId;
      if (fromOther) {
        // They sent a message, so they stopped typing
        dispatch(setTyping({ chatId, isTyping: false }));
        // Soft sound unless I'm looking at this exact chat
        if (viewedChatId() !== chatId) {
          playMessageSound();
          // It reached my device: the sender sees a grey double tick (blue once I open the chat)
          newSocket.emit('mark_delivered', { chatId });
        }
        markReadIfViewing(chatId);
      }
    });

    newSocket.on('chat_list_updated', (data) => {
      dispatch(updateChatList(data));
    });

    // Quotation changed: update its card live (full data after an edit, otherwise just the status)
    newSocket.on('quotation_updated', (data) => {
      if (!data?.quotationId) return;
      const patch = data.quotationData || Object.fromEntries(
        ['status', 'validUntil', 'version', 'respondedAt', 'customerResponse', 'viewedAt', 'replacedBy']
          .filter((k) => data[k] !== undefined)
          .map((k) => [k, data[k]])
      );
      dispatch(updateQuotation({ quotationId: String(data.quotationId), patch }));
    });

    // Deleted for everyone (by them or me in another tab), or "for me" in another tab of mine
    newSocket.on('message_deleted', (data) => {
      if (!data?.chatId || !data?.messageId) return;
      dispatch(deleteMessageLocal({ chatId: String(data.chatId), messageId: String(data.messageId), scope: data.scope || 'everyone' }));
    });

    newSocket.on('messages_delivered', (data) => {
      if (!data?.chatId || String(data.deliveredTo) === userId) return;
      dispatch(messagesDeliveredToOther({ chatId: String(data.chatId), myId: userId, deliveredAt: data.deliveredAt }));
    });

    newSocket.on('messages_read', (data) => {
      if (!data?.chatId) return;
      if (String(data.readBy) === userId) {
        dispatch(markChatAsRead(data.chatId)); // read in another tab of mine
      } else {
        dispatch(messagesReadByOther({ chatId: String(data.chatId), myId: userId }));
      }
    });

    newSocket.on('user_typing', (data) => {
      if (!data?.chatId || String(data.userId) === userId) return;
      const chatId = String(data.chatId);
      clearTimeout(typingTimers.current[chatId]);
      dispatch(setTyping({ chatId, isTyping: !!data.isTyping }));
      if (data.isTyping) {
        // Safety net: clear the indicator if the "stopped typing" event never comes
        typingTimers.current[chatId] = setTimeout(
          () => dispatch(setTyping({ chatId, isTyping: false })),
          TYPING_CLEAR_MS
        );
      }
    });

    newSocket.on('online_users_list', (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    newSocket.on('user_status_changed', (data) => {
      if (!data?.userId) return;
      if (data.status === 'online') dispatch(setUserOnline(data.userId));
      else dispatch(setUserOffline({ userId: data.userId, lastSeen: data.lastSeen }));
    });

    // Older per-chat presence events
    newSocket.on('user_online', (data) => data?.userId && dispatch(setUserOnline(data.userId)));
    newSocket.on('user_offline', (data) => data?.userId && dispatch(setUserOffline({ userId: data.userId, lastSeen: data.lastSeen })));

    newSocket.on('chat_error', (error) => {
      console.error('Chat error:', error);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connect error:', error?.message);
    });

    // Coming back to the tab with a chat open: what arrived meanwhile is now read
    const onVisible = () => {
      const chatId = viewedChatId();
      if (chatId) markReadIfViewing(chatId);
    };
    document.addEventListener('visibilitychange', onVisible);

    setSocket(newSocket);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, dispatch]);

  const value = useMemo(() => {
    const isUp = () => !!socket && socket.connected;

    // emit with an acknowledgement; resolves { ok, ... } and never rejects
    const emitWithAck = (event, payload) =>
      new Promise((resolve) => {
        if (!isUp()) return resolve({ ok: false, error: 'offline' });
        socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, (err, res) => {
          if (err) resolve({ ok: false, error: 'timeout' });
          else resolve(res || { ok: false });
        });
      });

    return {
      socket,
      connected,
      joinChat: (chatId) => (isUp() ? emitWithAck('join_chat', { chatId }) : Promise.resolve({ ok: false })),
      leaveChat: (chatId) => {
        if (isUp()) socket.emit('leave_chat', { chatId });
      },
      // Text message with delivery confirmation: resolves { ok, message } or { ok: false, error }
      sendChatMessage: ({ chatId, content, clientId, retry = false, replyToId }) =>
        emitWithAck('send_message', { chatId, content, clientId, retry, replyToId, messageType: 'text' }),
      // Older signature (fire and forget)
      sendMessage: (chatId, content, messageType = 'text', mediaUrl = null, fileName = null, fileSize = null) => {
        if (isUp()) socket.emit('send_message', { chatId, content, messageType, mediaUrl, fileName, fileSize });
      },
      // { chatId, messageId, scope: 'me' | 'everyone' } -> { ok, error? }
      deleteChatMessage: (payload) => emitWithAck('delete_message', payload),
      // { chatId, messageIds: [], scope } -> { ok, deleted: [], failed: [{ messageId, error }] }
      deleteChatMessages: (payload) => emitWithAck('delete_multiple_messages', payload),
      markMessagesRead: (chatId) => {
        if (isUp()) socket.emit('mark_messages_read', { chatId });
      },
      startTyping: (chatId) => {
        if (isUp()) socket.emit('typing_start', { chatId });
      },
      stopTyping: (chatId) => {
        if (isUp()) socket.emit('typing_stop', { chatId });
      },
    };
  }, [socket, connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
