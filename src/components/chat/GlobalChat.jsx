"use client"

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useChat } from '../../hooks/useChat';
import MessageBar from './MessageBar';
import ChatInbox from './ChatInbox';
import ChatView from './ChatView';

const TITLE_COUNT = /^\(\d+\+?\)\s/;

function GlobalChat() {
    const {
        isOpen,
        selectedChat,
        hasUser,
        toggleChat,
        openChat,
        closeChat,
        selectChat,
        backToInbox,
    } = useChat();
    const unreadCounts = useSelector((state) => state.chat.unreadCounts);
    const totalUnread = Object.values(unreadCounts || {}).reduce((sum, n) => sum + (n || 0), 0);

    // Opened from a chat push notification: ...?openChat=<chatId> opens that chat directly
    useEffect(() => {
        if (!hasUser || typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const chatId = url.searchParams.get('openChat');
        if (!chatId) return;
        openChat();
        selectChat({ id: chatId, chatId });
        url.searchParams.delete('openChat');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUser]);

    // Unread chat messages in the browser tab title, e.g. "(3) Click To Repair"
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const apply = () => {
            const base = document.title.replace(TITLE_COUNT, '');
            const next = totalUnread > 0 ? `(${totalUnread > 99 ? '99+' : totalUnread}) ${base}` : base;
            if (document.title !== next) document.title = next;
        };
        apply();
        // Pages change the title on navigation: put the count back
        const titleEl = document.querySelector('title');
        const observer = titleEl ? new MutationObserver(apply) : null;
        observer?.observe(titleEl, { childList: true, characterData: true, subtree: true });
        return () => {
            observer?.disconnect();
            document.title = document.title.replace(TITLE_COUNT, '');
        };
    }, [totalUnread]);

    // Phones: the open chat covers the page, so stop the page behind it from scrolling
    useEffect(() => {
        if (!isOpen || typeof window === 'undefined' || !window.matchMedia('(max-width: 639px)').matches) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    if (!hasUser) {
        return null;
    }

    return (
        <div className={`fixed z-50 ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-0 sm:right-0' : 'bottom-0 right-0'}`}>
            {isOpen ? (
                selectedChat ? (
                    <ChatView
                        key={selectedChat.id}
                        chat={selectedChat}
                        onBack={backToInbox}
                    />
                ) : (
                    <ChatInbox
                        onSelectChat={selectChat}
                        onClose={closeChat}
                    />
                )
            ) : (
                <MessageBar
                    onClick={toggleChat}
                />
            )}
        </div>
    );
}

export default GlobalChat;
