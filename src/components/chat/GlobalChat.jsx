"use client"

import React from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBar from './MessageBar';
import ChatInbox from './ChatInbox';
import ChatView from './ChatView';

function GlobalChat() {
    const {
        isOpen,
        selectedChat,
        hasUser,
        toggleChat,
        closeChat,
        selectChat,
        backToInbox,
    } = useChat();

    if (!hasUser) {
        return null;
    }

    return (
        <div className="fixed bottom-0 right-0 z-50">
            {isOpen ? (
                selectedChat ? (
                    <ChatView
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