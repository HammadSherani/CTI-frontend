"use client"

import React, { useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useChat } from '../../../../hooks/useChat';

const MessageBar = React.memo(({ onClick, unreadCount }) => (
  <div
    onClick={onClick}
    className="w-[360px] h-12 bg-[#0E1014] text-white flex items-center justify-between px-4 rounded-t-md shadow-md cursor-pointer relative"
  >
    <span className="text-sm font-medium">Messages</span>
    <div className="flex items-center gap-4">
      <div className="relative">
        <Icon icon="mdi:bell-outline" width="20" height="20" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <Icon icon="mdi:chevron-up" width="20" height="20" />
    </div>
  </div>
));

const ChatInbox = ({ onSelectChat, onClose }) => {
  const { chats, unreadCounts } = useChat();
  const chatList = Object.values(chats);

  return (
    <div className="w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 h-[500px]">
      <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="flex gap-4 items-center">
          <Icon icon="mdi:bell-outline" width={20} />
          <Icon icon="mdi:chevron-down" width={20} onClick={onClose} className="cursor-pointer" />
        </div>
      </div>
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
      <div className="flex justify-between items-center px-4 py-2 text-sm font-semibold">
        <span>Chats</span>
        <span className="text-blue-500 cursor-pointer">Requests</span>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {chatList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="mdi:message-outline" width={48} className="mx-auto mb-2 opacity-50" />
            <p>No chats yet</p>
          </div>
        ) : (
          chatList.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="flex items-start px-4 py-3 hover:bg-gray-50 cursor-pointer relative"
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    chat.online ? 'bg-green-500' : 'bg-gray-400'
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
                  {unreadCounts[chat.id] > 0 && (
                    <span className="text-xs bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center ml-2">
                      {unreadCounts[chat.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ChatView = ({ chat, onBack }) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const {
    messages,
    inputText,
    selectedFile,
    setInputText,
    setSelectedFile,
    clearSelectedFile,
    sendMessage,
  } = useChat();

  const chatMessages = messages[chat.id] || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim() && !selectedFile) return;
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 
                         selectedFile.type.startsWith('video/') ? 'video' : 'file';
        
        sendMessage({
          text: inputText.trim() || undefined,
          media: {
            url: reader.result,
            type: mediaType,
            name: selectedFile.name,
          },
        }, chat.id);
        
        fileInputRef.current.value = '';
      };
      reader.readAsDataURL(selectedFile);
    } else {
      sendMessage({ text: inputText }, chat.id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 h-[500px] flex flex-col">
      <div className="bg-[#0E1014] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            icon="mdi:arrow-left"
            width={20}
            onClick={onBack}
            className="cursor-pointer"
          />
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-8 h-8 rounded-md object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{chat.name}</span>
              {chat.verified && (
                <Icon icon="mdi:check-decagram" className="text-blue-500" width={16} />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {chat.online ? 'Online' : chat.username}
            </span>
          </div>
        </div>
        <Icon icon="mdi:dots-vertical" width={20} className="cursor-pointer" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="mdi:chat-outline" width={48} className="mx-auto mb-2 opacity-50" />
            <p>Start your conversation with {chat.name}</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } mb-2`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.media && (
                  <>
                    {message.media.type === 'image' && (
                      <img
                        src={message.media.url}
                        alt={message.media.name}
                        className="max-w-full h-auto rounded-md mb-1"
                      />
                    )}
                    {message.media.type === 'video' && (
                      <video
                        src={message.media.url}
                        controls
                        className="max-w-full h-auto rounded-md mb-1"
                      />
                    )}
                    {message.media.type === 'file' && (
                      <a
                        href={message.media.url}
                        download={message.media.name}
                        className="text-blue-500 underline block mb-1"
                      >
                        📎 {message.media.name}
                      </a>
                    )}
                  </>
                )}
                {message.text && <p className="text-sm">{message.text}</p>}
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <Icon icon="mdi:image" width={20} className="text-blue-500" />
              ) : selectedFile.type.startsWith('video/') ? (
                <Icon icon="mdi:video" width={20} className="text-purple-500" />
              ) : (
                <Icon icon="mdi:file" width={20} className="text-gray-500" />
              )}
              <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
            <Icon 
              icon="mdi:close" 
              width={16} 
              className="text-gray-500 cursor-pointer hover:text-red-500" 
              onClick={clearSelectedFile}
            />
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2">
          <Icon
            icon="mdi:paperclip"
            width={20}
            className="text-gray-500 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*,*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            placeholder="Type a message..."
            className="bg-transparent outline-none flex-1"
          />
          <Icon
            icon="mdi:send"
            width={20}
            className={`cursor-pointer ${
              inputText.trim() || selectedFile ? 'text-blue-500' : 'text-gray-400'
            }`}
            onClick={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

// Main Global Chat Component
function GlobalChat() {
  const {
    isOpen,
    selectedChat,
    unreadCounts,
    hasUser,
    toggleChat,
    closeChat,
    selectChat,
    backToInbox,
  } = useChat();

  // Don't render chat if no user
  if (!hasUser) {
    return null;
  }

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

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
          unreadCount={totalUnreadCount}
        />
      )}
    </div>
  );
}

// Chat Button component for anywhere in your app
export const ChatButton = ({ className = "" }) => {
  const { openChat, unreadCounts, hasUser } = useChat();
  
  // Don't render button if no user
  if (!hasUser) {
    return null;
  }
  
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <button
      onClick={openChat}
      className={`relative p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors ${className}`}
    >
      <Icon icon="mdi:message" width={24} />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
        </span>
      )}
    </button>
  );
};

export default GlobalChat;