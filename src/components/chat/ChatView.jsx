"use client"

import React, { useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useChat } from '@/hooks/useChat';
import { useDispatch, useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import {
    setMessages,
    clearSelectedFiles,
    setSelectedFiles,
    prependMessages,
    addMessage,
    setMessageStatus,
    updateMessage,
    markChatAsRead,
} from '@/store/chat';
import { useSocket } from '@/contexts/SocketProvider';
import QuotationForm from './QuotationForm';
import QuotationMessage from './QuotationMessage';
import { ChatImage, ChatVideo, ChatFile, ChatVoice, ReplyQuote, mediaKindOf } from './MessageMedia';
import ChatComposer from './ChatComposer';
import ChatSearch from './ChatSearch';

// One-line description of a message (reply preview)
const messagePreview = (m) => {
    const kind = (m.mediaUrl || m.localUrl || m.mediaKind) ? mediaKindOf(m) : null;
    if (m.content) return m.content;
    if (kind === 'image') return '📷 Photo';
    if (kind === 'video') return '🎥 Video';
    if (kind === 'voice') return '🎤 Voice message';
    if (kind === 'file') return `📎 ${m.fileName || 'File'}`;
    return 'Message';
};
const messageKeysOf = (m) => [m._id, m.messageId, m.clientId].filter(Boolean).map(String);
import { toast } from 'react-toastify';

const TYPING_THROTTLE_MS = 2000; // send "typing" at most every 2s
const TYPING_IDLE_MS = 1500;     // "stopped typing" after 1.5s without keys

// Helper function to get file icon based on file type
const getFileIcon = (fileName) => {
    if (!fileName) return { icon: 'mdi:file', color: 'text-gray-500' };
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return { icon: 'mdi:file-pdf-box', color: 'text-red-500' };
    if (['doc', 'docx'].includes(ext)) return { icon: 'mdi:file-word-box', color: 'text-blue-600' };
    if (['xls', 'xlsx'].includes(ext)) return { icon: 'mdi:file-excel-box', color: 'text-green-600' };
    if (['txt'].includes(ext)) return { icon: 'mdi:file-document', color: 'text-gray-600' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: 'mdi:folder-zip', color: 'text-yellow-600' };
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(ext)) return { icon: 'mdi:video', color: 'text-purple-500' };
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return { icon: 'mdi:music', color: 'text-pink-500' };
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext)) {
        return { icon: 'mdi:code-braces', color: 'text-indigo-500' };
    }
    return { icon: 'mdi:file', color: 'text-gray-500' };
};

const getFileNameFromUrl = (url) => {
    if (!url) return 'Unknown File';
    try {
        const urlParts = url.split('/');
        return decodeURIComponent(urlParts[urlParts.length - 1]);
    } catch {
        return 'File';
    }
};

const newClientId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const msgTime = (m) => new Date(m.timestamp || m.createdAt);

const dayLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
};

const lastSeenText = (iso) => {
    if (!iso) return 'Offline';
    const d = new Date(iso);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'Last seen just now';
    if (mins < 60) return `Last seen ${mins} min ago`;
    if (d.toDateString() === new Date().toDateString()) {
        return `Last seen today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Last seen ${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
};

// Message Skeleton Component
const MessageSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${i % 2 === 0 ? 'bg-primary-100' : 'bg-gray-200'} animate-pulse`}>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
            </div>
        ))}
    </div>
);

// Delivery state of my own message: sending (clock), failed (retry), sent (✓), read (✓✓)
const MessageStatus = ({ message, onRetry }) => {
    if (message.status === 'sending') {
        return <Icon icon="mdi:clock-outline" width={13} className="text-gray-200" title="Sending…" />;
    }
    if (message.status === 'failed') {
        return (
            <button type="button" onClick={onRetry} className="flex items-center gap-0.5 text-[11px] font-semibold text-red-100 hover:text-white" title="Not sent. Tap to retry">
                <Icon icon="mdi:alert-circle" width={13} /> Retry
            </button>
        );
    }
    // ✓✓ blue = seen, ✓✓ = delivered to their device, ✓ = sent (saved on the server)
    if (message.isRead) {
        return (
            <span className="inline-flex items-center justify-center rounded-full bg-white/90 px-0.5" title="Seen">
                <Icon icon="mdi:check-all" width={15} className="text-blue-600" />
            </span>
        );
    }
    if (message.deliveredAt) {
        return <Icon icon="mdi:check-all" width={15} className="text-gray-100" title="Delivered" />;
    }
    return <Icon icon="mdi:check" width={15} className="text-gray-100" title="Sent" />;
};

const ChatView = ({ chat, onBack }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [showQuotationForm, setShowQuotationForm] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [oldestMessageId, setOldestMessageId] = useState(null);
    const [otherUserId, setOtherUserId] = useState(chat.otherUserId || chat.otherUser?._id || null);
    const [replyingTo, setReplyingTo] = useState(null); // { messageId, preview, mine }
    const [showSearch, setShowSearch] = useState(false);
    const [highlightId, setHighlightId] = useState(null);

    const { token, user } = useSelector((state) => state.auth);
    const { messages, inputText, selectedFiles, setInputText: updateInputText } = useChat();
    const onlineUsers = useSelector((state) => state.chat.onlineUsers);
    const lastSeenMap = useSelector((state) => state.chat.lastSeen);
    const isTyping = useSelector((state) => !!state.chat.typing[chat.id]);
    // Fallback when we don't know the other person's id yet: the inbox entry
    const listEntry = useSelector((state) => state.chat.chats.find((c) => String(c.id) === String(chat.id) || String(c.chatId) === String(chat.id)));

    const { connected, joinChat, leaveChat, sendChatMessage, startTyping, stopTyping } = useSocket();

    const chatMessages = messages[chat.id] || [];
    // Login returns the id as `id`, other flows as `_id`
    const myId = (user?._id || user?.id) ? String(user._id || user.id) : null;

    // Skeleton only when nothing is cached for this chat yet; otherwise show the cached
    // messages instantly and refresh quietly in the background (new ones arrive via socket)
    const [initialLoading, setInitialLoading] = useState(() => !(messages?.[chat.id]?.length > 0));

    const otherId = otherUserId || listEntry?.otherUser?._id || null;
    // Opened from a link/notification we may only know the chat id: take name/photo from the inbox
    const displayName = chat.name || listEntry?.otherUser?.name;
    const displayAvatar = chat.avatar || listEntry?.otherUser?.avatar;
    const isOnline = otherId ? onlineUsers.includes(String(otherId)) : !!chat.online;
    const statusLine = isTyping
        ? 'typing…'
        : isOnline
            ? 'Online'
            : otherId ? lastSeenText(lastSeenMap[String(otherId)]) : (chat.username || 'Offline');

    const isMine = useCallback((message) => {
        if (message.sender === 'user') return true;
        const senderIdStr = typeof message?.senderId === 'object' ? message?.senderId?._id : message?.senderId;
        if (senderIdStr && myId) return String(senderIdStr) === myId;
        return (user?.role === 'admin' && message?.senderType === 'repairman') || user?.role === message?.senderType;
    }, [myId, user?.role]);

    // ---- join the chat room (again after every reconnect) ----
    useEffect(() => {
        if (!chat.id || !connected) return undefined;
        let active = true;
        joinChat(chat.id).then((res) => {
            if (active && res?.ok && res.otherUserId) setOtherUserId(res.otherUserId);
        });
        return () => {
            active = false;
            leaveChat(chat.id);
        };
    }, [chat.id, connected, joinChat, leaveChat]);

    // ---- load messages ----
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

            if (data.success) {
                const loaded = (data.messages || []).map((m) => ({ ...m, status: 'sent' }));
                if (before) {
                    dispatch(prependMessages({ chatId: chat.id, messages: loaded }));
                } else {
                    dispatch(setMessages({ chatId: chat.id, messages: loaded }));
                    dispatch(markChatAsRead(chat.id)); // the API marks them read on the server
                }
                setHasMore(data.hasMore);
                if (data.oldestMessageId) setOldestMessageId(data.oldestMessageId);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            handleError(error);
        } finally {
            setLoadingMore(false);
            setInitialLoading(false);
        }
    }, [chat.id, token, dispatch]);

    // Open (or switch to) a chat: show cache, refresh in background
    useEffect(() => {
        setInitialLoading(chatMessages.length === 0);
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat.id]);

    // After a reconnect: catch up on anything sent while we were offline
    const wasConnected = useRef(connected);
    useEffect(() => {
        if (connected && !wasConnected.current) fetchMessages();
        wasConnected.current = connected;
    }, [connected, fetchMessages]);

    // ---- scrolling (WhatsApp style) ----
    // The message list is a `flex-col-reverse` scroller: it is anchored at the BOTTOM, so a chat
    // opens on the newest message with no visible scrolling, older pages added on top don't move
    // what you're reading, and new messages at the bottom stay in view.
    // In this layout scrollTop is 0 at the bottom and negative when scrolled up.
    const [showJumpDown, setShowJumpDown] = useState(false);
    const [newWhileUp, setNewWhileUp] = useState(0);

    const distanceFromBottom = () => Math.abs(messagesContainerRef.current?.scrollTop || 0);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesContainerRef.current?.scrollTo({ top: 0, behavior });
        setNewWhileUp(0);
    }, []);

    // New message at the bottom: my own -> go down; theirs while I'm reading older ones -> count it
    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastKey = lastMessage ? (lastMessage.id || lastMessage._id || lastMessage.clientId) : null;
    const prevLastKey = useRef(lastKey);
    useEffect(() => {
        if (!lastKey || lastKey === prevLastKey.current) return;
        const isFirst = prevLastKey.current == null;
        prevLastKey.current = lastKey;
        if (isFirst) return;
        if (isMine(lastMessage)) scrollToBottom('smooth');
        else if (distanceFromBottom() > 150) setNewWhileUp((n) => n + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastKey]);

    // Reading older messages while a new one arrives at the bottom: keep the view exactly still
    // (bottom-anchored lists would otherwise shift up by the new bubble's height)
    const layoutRef = useRef({ height: 0, lastKey: null });
    useLayoutEffect(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const prev = layoutRef.current;
        const grewAtBottom = prev.lastKey && lastKey && lastKey !== prev.lastKey;
        if (grewAtBottom && prev.height && Math.abs(el.scrollTop) > 150 && !isMine(lastMessage)) {
            el.scrollTop -= el.scrollHeight - prev.height;
        }
        layoutRef.current = { height: el.scrollHeight, lastKey };
    });

    // Opening / switching chat: start at the newest message
    useEffect(() => {
        prevLastKey.current = null;
        setShowJumpDown(false);
        setNewWhileUp(0);
        if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = 0;
    }, [chat.id]);

    const handleScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const fromBottom = Math.abs(el.scrollTop);
        setShowJumpDown(fromBottom > 300);
        if (fromBottom < 50) setNewWhileUp(0);
        // Near the top -> load the previous page (the view stays where it is)
        const fromTop = el.scrollHeight - el.clientHeight - fromBottom;
        if (fromTop < 120 && hasMore && !loadingMore && oldestMessageId) {
            fetchMessages(oldestMessageId);
        }
    }, [hasMore, loadingMore, oldestMessageId, fetchMessages]);

    // ---- typing indicator (throttled) ----
    const typingState = useRef({ lastSent: 0, idleTimer: null, active: false });
    const stopTypingNow = useCallback(() => {
        const t = typingState.current;
        clearTimeout(t.idleTimer);
        if (t.active) {
            stopTyping(chat.id);
            t.active = false;
            t.lastSent = 0;
        }
    }, [chat.id, stopTyping]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        updateInputText(value);
        const t = typingState.current;
        if (!value.trim()) {
            stopTypingNow();
            return;
        }
        const now = Date.now();
        if (now - t.lastSent > TYPING_THROTTLE_MS) {
            startTyping(chat.id);
            t.lastSent = now;
            t.active = true;
        }
        clearTimeout(t.idleTimer);
        t.idleTimer = setTimeout(stopTypingNow, TYPING_IDLE_MS);
    }, [chat.id, startTyping, stopTypingNow, updateInputText]);

    useEffect(() => () => stopTypingNow(), [stopTypingNow]);

    // ---- sending ----
    // Text: the bubble appears instantly ("sending"), then turns into ✓ when the server confirms.
    // If the socket is down the same message goes over HTTP; if that fails too it shows "Retry".
    const deliverText = useCallback(async (clientId, content, retry = false, replyToId = undefined) => {
        dispatch(setMessageStatus({ chatId: chat.id, clientId, status: 'sending' }));
        let res = await sendChatMessage({ chatId: chat.id, content, clientId, retry, replyToId });
        if (!res?.ok && (res?.error === 'offline' || res?.error === 'timeout')) {
            try {
                const { data } = await axiosInstance.post(
                    `/chat/${chat.id}/send`,
                    { content, messageType: 'text', clientId, replyToId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                res = data?.success ? { ok: true, message: data.message } : { ok: false };
            } catch {
                res = { ok: false };
            }
        }
        if (res?.ok && res.message) {
            dispatch(addMessage({ chatId: chat.id, message: { ...res.message, clientId, status: 'sent' } }));
        } else {
            dispatch(setMessageStatus({ chatId: chat.id, clientId, status: 'failed' }));
            if (res?.error && !['offline', 'timeout'].includes(res.error)) toast.error(res.error);
        }
    }, [chat.id, dispatch, sendChatMessage, token]);

    // ---- media: show the local preview at once, upload in the background with progress ----
    const pendingUploads = useRef(new Map()); // clientId -> { file, content, messageType, lastPct }

    const uploadFile = useCallback(async (clientId) => {
        const job = pendingUploads.current.get(clientId);
        if (!job) return;
        job.lastPct = 0;
        dispatch(updateMessage({ chatId: chat.id, clientId, changes: { status: 'sending', progress: 0 } }));
        const formData = new FormData();
        formData.append('content', job.content);
        formData.append('media', job.file);
        formData.append('clientId', clientId);
        formData.append('messageType', job.messageType);
        if (job.duration) formData.append('duration', String(job.duration));
        if (job.replyToId) formData.append('replyToId', job.replyToId);
        try {
            const { data } = await axiosInstance.post(`/chat/${chat.id}/send`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (!e.total) return;
                    const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
                    if (pct - job.lastPct >= 5) { // don't re-render on every byte
                        job.lastPct = pct;
                        dispatch(updateMessage({ chatId: chat.id, clientId, changes: { progress: pct } }));
                    }
                },
            });
            if (!data?.message) throw new Error('Upload failed');
            // Saved: same bubble becomes the real message (local preview stays, no flicker)
            dispatch(addMessage({ chatId: chat.id, message: { ...data.message, clientId, status: 'sent', progress: 100 } }));
            pendingUploads.current.delete(clientId);
        } catch (error) {
            console.error('Error uploading file:', error);
            dispatch(updateMessage({ chatId: chat.id, clientId, changes: { status: 'failed' } }));
        }
    }, [chat.id, token, dispatch]);

    const handleRetry = useCallback((message) => {
        if (!message.clientId) return;
        if (pendingUploads.current.has(message.clientId)) uploadFile(message.clientId);
        else deliverText(message.clientId, message.content, true, message.replyTo?.messageId);
    }, [deliverText, uploadFile]);

    const mySenderType = user?.role === 'customer' ? 'customer' : 'repairman';
    // Local copy of the quoted message for the optimistic bubble (the server stores its own)
    const replySnapshot = replyingTo
        ? { messageId: replyingTo.messageId, content: replyingTo.preview, senderId: replyingTo.mine ? myId : otherId, mediaUrl: replyingTo.thumb, messageType: replyingTo.messageType }
        : undefined;

    const sendFiles = useCallback((messageContent) => {
        const files = [...selectedFiles];
        const replyToId = replyingTo?.messageId;
        const ids = files.map((file, index) => {
            const clientId = newClientId();
            const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
            // Text (and the reply) go with the first file only
            const content = index === 0 && messageContent ? messageContent : '';
            const messageType = content ? 'mixed' : kind;
            pendingUploads.current.set(clientId, { file, content, messageType, lastPct: 0, replyToId: index === 0 ? replyToId : undefined });
            dispatch(addMessage({
                chatId: chat.id,
                message: {
                    clientId,
                    content,
                    messageType,
                    mediaKind: kind,
                    localUrl: kind === 'file' ? undefined : URL.createObjectURL(file),
                    fileName: file.name,
                    fileSize: file.size,
                    senderId: myId,
                    senderType: mySenderType,
                    replyTo: index === 0 ? replySnapshot : undefined,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    status: 'sending',
                    progress: 0,
                },
            }));
            return clientId;
        });
        // Input is free again right away; uploads continue in the background
        updateInputText('');
        setReplyingTo(null);
        dispatch(clearSelectedFiles());
        ids.forEach((clientId) => uploadFile(clientId));
    }, [selectedFiles, replyingTo, replySnapshot, mySenderType, dispatch, chat.id, myId, updateInputText, uploadFile]);

    // Voice note from the composer: shows at once, uploads in the background
    const sendVoice = useCallback((blob, duration) => {
        const clientId = newClientId();
        const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || 'audio/webm' });
        pendingUploads.current.set(clientId, { file, content: '', messageType: 'voice', duration, lastPct: 0, replyToId: replyingTo?.messageId });
        dispatch(addMessage({
            chatId: chat.id,
            message: {
                clientId,
                content: '',
                messageType: 'voice',
                mediaKind: 'voice',
                localUrl: URL.createObjectURL(blob),
                duration,
                fileSize: blob.size,
                senderId: myId,
                senderType: mySenderType,
                replyTo: replySnapshot,
                timestamp: new Date().toISOString(),
                isRead: false,
                status: 'sending',
                progress: 0,
            },
        }));
        setReplyingTo(null);
        uploadFile(clientId);
    }, [chat.id, dispatch, myId, mySenderType, replyingTo, replySnapshot, uploadFile]);

    // ---- reply / jump to a message ----
    const startReply = useCallback((message) => {
        const kind = (message.mediaUrl || message.localUrl) ? mediaKindOf(message) : null;
        setReplyingTo({
            messageId: message.messageId || message._id,
            preview: messagePreview(message),
            mine: isMine(message),
            messageType: message.messageType,
            thumb: kind === 'image' ? (message.thumbnailUrl || message.mediaUrl) : undefined,
        });
    }, [isMine]);

    const flash = (el, id) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightId(id);
        setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 2000);
    };

    const pendingJump = useRef(null);
    const findBubble = (id) => messagesContainerRef.current?.querySelector(`[data-mids~="${CSS.escape(String(id))}"]`);

    // Older message not loaded yet: load enough history to include it, then scroll there
    const jumpToMessage = useCallback(async (id) => {
        if (!id) return;
        setShowSearch(false);
        const el = findBubble(id);
        if (el) {
            flash(el, String(id));
            return;
        }
        try {
            const { data: pos } = await axiosInstance.get(`/chat/${chat.id}/messages/${id}/position`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const need = (pos?.newerCount || 0) + 15;
            if (need > 300) {
                toast.info('That message is too far back to jump to');
                return;
            }
            const { data } = await axiosInstance.get(`/chat/${chat.id}/messages`, {
                params: { limit: need, markRead: false },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data?.success) {
                pendingJump.current = String(id);
                dispatch(setMessages({ chatId: chat.id, messages: (data.messages || []).map((m) => ({ ...m, status: 'sent' })) }));
                setHasMore(data.hasMore);
                if (data.oldestMessageId) setOldestMessageId(data.oldestMessageId);
            }
        } catch {
            toast.error('Could not find that message');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat.id, token, dispatch]);

    useEffect(() => {
        if (!pendingJump.current) return;
        const id = pendingJump.current;
        const el = findBubble(id);
        if (el) {
            pendingJump.current = null;
            requestAnimationFrame(() => flash(el, id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatMessages]);

    const handleSendMessage = useCallback(async (e) => {
        e?.preventDefault?.();
        const messageContent = inputText.trim();
        const hasFiles = selectedFiles && selectedFiles.length > 0;
        if ((!messageContent && !hasFiles) || sending) return;

        stopTypingNow();

        if (hasFiles) {
            sendFiles(messageContent);
            return;
        }

        const clientId = newClientId();
        dispatch(addMessage({
            chatId: chat.id,
            message: {
                clientId,
                content: messageContent,
                messageType: 'text',
                senderId: myId,
                senderType: mySenderType,
                replyTo: replySnapshot,
                timestamp: new Date().toISOString(),
                isRead: false,
                status: 'sending',
            },
        }));
        updateInputText('');
        setReplyingTo(null);
        deliverText(clientId, messageContent, false, replyingTo?.messageId);
    }, [inputText, selectedFiles, sending, stopTypingNow, sendFiles, dispatch, chat.id, myId, mySenderType, replySnapshot, replyingTo, updateInputText, deliverText]);

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (files.length > 5) {
                toast.error("You can only upload up to 5 files at a time.");
                dispatch(setSelectedFiles(files.slice(0, 5)));
            } else {
                dispatch(setSelectedFiles(files));
            }
        }
    }, [dispatch]);

    const handleQuotationSuccess = useCallback(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleModelClose = () => {
        setShowQuotationForm(false);
        localStorage.removeItem(`selectedParts_quotation_chat_${chat.id}`);
    };

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    }, [handleSendMessage]);

    const handleFileClick = useCallback((mediaUrl) => {
        if (mediaUrl) window.open(mediaUrl, '_blank');
    }, []);

    // Messages in time order with a date divider whenever the day changes
    const timeline = useMemo(() => {
        const items = [];
        let lastDay = null;
        chatMessages.forEach((message) => {
            const day = msgTime(message).toDateString();
            if (day !== lastDay) {
                items.push({ divider: true, key: `day-${day}`, label: dayLabel(msgTime(message)) });
                lastDay = day;
            }
            items.push({ message, key: message.id || message._id || message.clientId });
        });
        return items;
    }, [chatMessages]);

    return (
        <>
            {/* Phones: full screen. Larger screens: the floating box */}
            <div className="flex flex-col w-screen h-[100dvh] sm:w-96 sm:h-[500px] sm:max-h-[calc(100vh-2rem)] bg-white sm:rounded-lg shadow-xl sm:border border-gray-200">
                <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between relative">
                    <div className="flex items-center gap-2 min-w-0">
                        <Icon icon="mdi:arrow-left" width={20} onClick={onBack} className="cursor-pointer hover:opacity-70 shrink-0" />
                        <div className="relative shrink-0">
                            <img
                                src={displayAvatar || 'https://i.pravatar.cc/100?img=1'}
                                alt={displayName}
                                className="w-8 h-8 rounded-md object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://i.pravatar.cc/100?img=1';
                                }}
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0E1014] ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-sm truncate">{displayName || 'Chat'}</span>
                                {chat.verified && (
                                    <Icon icon="mdi:check-decagram" className="text-primary-500" width={16} />
                                )}
                            </div>
                            <span className={`text-xs block truncate ${isTyping ? 'text-green-400' : 'text-gray-400'}`}>
                                {statusLine}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => setShowSearch(true)} className="hover:opacity-70" aria-label="Search in chat">
                            <Icon icon="mdi:magnify" width={20} />
                        </button>
                        {!connected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300" title="Reconnecting…">
                                Reconnecting…
                            </span>
                        )}
                        {user?.role === 'repairman' && (
                            <p
                                onClick={() => setShowQuotationForm(true)}
                                className='text-sm cursor-pointer border py-1 px-2 rounded-sm'>Create Quote</p>
                        )}
                    </div>
                </div>

                <div className="relative flex-1 min-h-0 flex flex-col">
                {showSearch && (
                    <ChatSearch
                        chatId={chat.id}
                        token={token}
                        myId={myId}
                        otherName={displayName}
                        onJump={jumpToMessage}
                        onClose={() => setShowSearch(false)}
                    />
                )}
                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    // column-reverse = anchored at the bottom (newest message shows first, no scroll jump)
                    className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse bg-gray-50"
                    style={{ overscrollBehavior: 'contain', overflowAnchor: 'none' }}
                >
                <div className="p-4 mb-auto">
                    {loadingMore && (
                        <div className="flex justify-center py-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        </div>
                    )}

                    {!loadingMore && hasMore && chatMessages.length >= 20 && (
                        <div className="text-center py-2 text-xs text-gray-400">
                            Scroll up to load more
                        </div>
                    )}

                    {initialLoading ? (
                        <MessageSkeleton />
                    ) : chatMessages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Icon icon="mdi:chat-outline" width={48} className="mx-auto mb-2 opacity-50" />
                            <p>Start your conversation with {displayName || 'this user'}</p>
                        </div>
                    ) : (
                        timeline.map((item) => {
                            if (item.divider) {
                                return (
                                    <div key={item.key} className="flex justify-center my-3">
                                        <span className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-0.5 shadow-sm">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            }
                            const message = item.message;

                            // Quotation messages
                            if (message.messageType === 'quotation' && message.quotationData) {
                                return (
                                    <QuotationMessage
                                        key={item.key}
                                        message={message}
                                        isOwner={user.role === message.senderType}
                                        chatId={chat.id}
                                        onQuotationUpdate={() => fetchMessages()}
                                    />
                                );
                            }

                            const isOwner = isMine(message);
                            const keys = messageKeysOf(message);
                            const highlighted = highlightId && keys.includes(highlightId);
                            const canReply = !!(message.messageId || message._id) && message.status !== 'sending' && message.status !== 'failed';
                            const replyMine = message.replyTo && myId && String(message.replyTo.senderId?._id || message.replyTo.senderId) === myId;

                            return (
                                <div
                                    key={item.key}
                                    data-mids={keys.join(' ')}
                                    className={`group flex items-center gap-1 ${isOwner ? "justify-end" : "justify-start"} mb-2`}
                                >
                                    {/* Reply button (hover on desktop; long-press the bubble on phones) */}
                                    {isOwner && canReply && (
                                        <button type="button" onClick={() => startReply(message)} className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity" aria-label="Reply">
                                            <Icon icon="mdi:reply" width={18} />
                                        </button>
                                    )}
                                    <div
                                        onContextMenu={(e) => { if (canReply && window.matchMedia('(pointer: coarse)').matches) { e.preventDefault(); startReply(message); } }}
                                        className={`max-w-[75%] p-2 rounded-lg transition-shadow ${highlighted ? 'ring-4 ring-yellow-300' : ''} ${isOwner
                                            ? `bg-primary-500 text-white ${message.status === 'failed' ? 'opacity-80 ring-1 ring-red-300' : ''}`
                                            : "bg-gray-200 text-gray-800"
                                            }`}
                                    >
                                        <ReplyQuote replyTo={message.replyTo} isOwner={isOwner} mine={replyMine} otherName={displayName} onJump={jumpToMessage} />

                                        {/* Media: fixed-size box right away, the picture/video loads into it later */}
                                        {(message.mediaUrl || message.localUrl || message.mediaKind) && (() => {
                                            const kind = mediaKindOf(message);
                                            if (kind === 'voice') {
                                                return <ChatVoice message={message} isOwner={isOwner} onRetry={() => handleRetry(message)} />;
                                            }
                                            if (kind === 'image') {
                                                return <ChatImage message={message} onOpen={handleFileClick} onRetry={() => handleRetry(message)} />;
                                            }
                                            if (kind === 'video') {
                                                return <ChatVideo message={message} onRetry={() => handleRetry(message)} />;
                                            }
                                            return (
                                                <ChatFile
                                                    message={message}
                                                    isOwner={isOwner}
                                                    icon={getFileIcon(message.fileName || getFileNameFromUrl(message.mediaUrl))}
                                                    onOpen={handleFileClick}
                                                    onRetry={() => handleRetry(message)}
                                                />
                                            );
                                        })()}

                                        {/* Text Content */}
                                        {(message.content || message.text) && (
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content || message.text}
                                            </p>
                                        )}

                                        {/* Contact details were hidden by the server */}
                                        {message.contactMasked && (
                                            <p className={`text-[11px] mt-1 flex items-center gap-1 ${isOwner ? 'text-white/80' : 'text-gray-500'}`}>
                                                <Icon icon="mdi:shield-lock-outline" width={13} />
                                                Contact details are hidden. Keep chats and payments on CTI to stay protected.
                                            </p>
                                        )}

                                        {/* Time + delivery status */}
                                        <span className={`text-xs mt-1 flex items-center justify-end gap-1 ${isOwner ? 'text-gray-200' : 'text-gray-500'}`}>
                                            {msgTime(message).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            {isOwner && <MessageStatus message={message} onRetry={() => handleRetry(message)} />}
                                        </span>
                                    </div>
                                    {!isOwner && canReply && (
                                        <button type="button" onClick={() => startReply(message)} className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity" aria-label="Reply">
                                            <Icon icon="mdi:reply" width={18} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* Other person is typing */}
                    {isTyping && !initialLoading && (
                        <div className="flex justify-start mb-2">
                            <div className="bg-gray-200 rounded-lg px-3 py-2 flex items-center gap-1" aria-label="typing">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                </div>

                {/* Jump to the newest message (with count of messages that arrived meanwhile) */}
                {(showJumpDown || newWhileUp > 0) && (
                    <button
                        type="button"
                        onClick={() => scrollToBottom('smooth')}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        aria-label="Scroll to newest message"
                    >
                        <Icon icon="mdi:chevron-double-down" width={20} />
                        {newWhileUp > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {newWhileUp > 9 ? '9+' : newWhileUp}
                            </span>
                        )}
                    </button>
                )}
                </div>

                {/* File Preview */}
                {selectedFiles && selectedFiles.length > 0 && (
                    <div className="px-4 py-2 border-t bg-gray-50 max-h-32 overflow-y-auto space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    {file.type.startsWith('image/') ? (
                                        <Icon icon="mdi:image" width={20} className="text-primary-500" />
                                    ) : file.type.startsWith('video/') ? (
                                        <Icon icon="mdi:video" width={20} className="text-purple-500" />
                                    ) : (
                                        <Icon icon={getFileIcon(file.name).icon} width={20} className={getFileIcon(file.name).color} />
                                    )}
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <Icon
                                    icon="mdi:close"
                                    width={16}
                                    className="text-gray-500 cursor-pointer hover:text-red-500"
                                    onClick={() => {
                                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                                        dispatch(setSelectedFiles(newFiles));
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Input: reply preview, emoji, attach, text, voice note / send */}
                <ChatComposer
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' && replyingTo) setReplyingTo(null);
                        handleKeyDown(e);
                    }}
                    onBlur={stopTypingNow}
                    onSend={handleSendMessage}
                    onFilesPicked={handleFileSelect}
                    onSendVoice={sendVoice}
                    replyingTo={replyingTo}
                    replyingToMine={replyingTo?.mine}
                    otherName={displayName}
                    onCancelReply={() => setReplyingTo(null)}
                    disabled={sending}
                    hasFiles={!!(selectedFiles && selectedFiles.length > 0)}
                />
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
