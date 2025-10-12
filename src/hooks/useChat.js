  // hooks/useChat.js
  import { useSelector, useDispatch } from 'react-redux';
  import { useCallback, useEffect } from 'react';
  import { useSocket } from '@/contexts/SocketProvider';
  import {
    toggleChat,
    openChat,
    closeChat,
    selectChat,
    backToInbox,
    setInputText,
    setSelectedFile,
    clearSelectedFile,
    sendMessage,
    addMessage,
    addChat,
    removeChat,
    markChatAsRead,
    setMessages,
    loadUserChats,
  } from '../store/chat';
  import axiosInstance from '@/config/axiosInstance';
  import handleError from '@/helper/handleError';

  export const useChat = () => {
    const dispatch = useDispatch();
    const chatState = useSelector((state) => state.chat);
    const { token, user } = useSelector((state) => state.auth);
    const { 
      socket, 
      connected, 
      joinChat, 
      leaveChat, 
      sendMessage: socketSendMessage, 
      markMessagesRead, 
      startTyping, 
      stopTyping 
    } = useSocket();

    // Auto-join chat when selected
    useEffect(() => {
      if (chatState.selectedChat && connected) {
        joinChat(chatState.selectedChat.id);
        
        return () => {
          if (chatState.selectedChat) {
            leaveChat(chatState.selectedChat.id);
          }
        };
      }
    }, [chatState.selectedChat, connected, joinChat, leaveChat]);

    const handleToggleChat = useCallback(() => {
      if (!chatState.currentUser) return;
      dispatch(toggleChat());
    }, [dispatch, chatState.currentUser]);

    const handleOpenChat = useCallback(() => {
      if (!chatState.currentUser) return;
      dispatch(openChat());
    }, [dispatch, chatState.currentUser]);

    const handleCloseChat = useCallback(() => {
      dispatch(closeChat());
    }, [dispatch]);

    const handleSelectChat = useCallback((chat) => {
      if (!chatState.currentUser) return;
      dispatch(selectChat(chat));
      const chatId = chat.id;
      dispatch(markChatAsRead(chatId));
    }, [dispatch, chatState.currentUser]);

    const handleBackToInbox = useCallback(() => {
      dispatch(backToInbox());
    }, [dispatch]);

    const handleSetInputText = useCallback((text) => {
      if (!chatState.currentUser) return;
      dispatch(setInputText(text));
      
      // Typing indicators
      if (text.trim() && chatState.selectedChat && connected) {
        startTyping(chatState.selectedChat.id);
      } else if (chatState.selectedChat && connected) {
        stopTyping(chatState.selectedChat.id);
      }
    }, [dispatch, chatState.currentUser, chatState.selectedChat, connected, startTyping, stopTyping]);

    const handleSetSelectedFile = useCallback((file) => {
      if (!chatState.currentUser) return;
      dispatch(setSelectedFile(file));
    }, [dispatch, chatState.currentUser]);

    const handleClearSelectedFile = useCallback(() => {
      dispatch(clearSelectedFile());
    }, [dispatch]);

    // Updated sendMessage with real API + Socket
    const handleSendMessage = useCallback(async (content, chatId) => {
      if (!chatState.currentUser) return;
      
      try {
        // If socket connected, use socket
        if (connected && socket) {
          const messageData = typeof content === 'string' ? { content } : content;
          
          socketSendMessage(
            chatId,
            messageData.content || '',
            messageData.messageType || 'text',
            messageData.mediaUrl,
            messageData.fileName,
            messageData.fileSize
          );
        } else {
          // Fallback to HTTP API
          const formData = new FormData();
          if (typeof content === 'string') {
            formData.append('content', content);
          } else {
            if (content.content) formData.append('content', content.content);
            if (content.media) formData.append('media', content.media);
            if (content.messageType) formData.append('messageType', content.messageType);
          }

          await axiosInstance.post(`/chat/${chatId}/send`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
          });
        }

        // Clear input
        dispatch(setInputText(''));
        dispatch(clearSelectedFile());
        
      } catch (error) {
        console.error('Error sending message:', error);
        handleError(error);
      }
    }, [dispatch, chatState.currentUser, connected, socket, socketSendMessage, token]);

    const handleAddChat = useCallback((chat) => {
      if (!chatState.currentUser) return;
      dispatch(addChat(chat));
    }, [dispatch, chatState.currentUser]);

    const handleRemoveChat = useCallback((chatId) => {
      if (!chatState.currentUser) return;
      dispatch(removeChat(chatId));
    }, [dispatch, chatState.currentUser]);

    const handleMarkAsRead = useCallback((chatId) => {
      dispatch(markChatAsRead(chatId));
      
      // Also mark on server via socket
      if (connected && chatState.messages[chatId]) {
        const messageIds = chatState.messages[chatId]
          .filter(msg => msg.senderType !== user?.role)
          .map(msg => msg.messageId || msg._id);
        
        if (messageIds.length > 0) {
          markMessagesRead(chatId, messageIds);
        }
      }
    }, [dispatch, connected, chatState.messages, user?.role, markMessagesRead]);

    // Fetch chat list
    const fetchChatList = useCallback(async () => {
      if (!token) return;

      try {
        const { data } = await axiosInstance.get("/chat/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(loadUserChats({
          chats: data.chats || [],
          messages: {},
          unreadCounts: {}
        }));
      } catch (error) {
        handleError(error);
      }
    }, [token, dispatch]);

    // Fetch messages for a chat
    const fetchMessages = useCallback(async (chatId) => {
      if (!token || !chatId) return;

      try {
        const { data } = await axiosInstance.get(`/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setMessages({ chatId, messages: data.messages || [] }));
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        handleError(error);
      }
    }, [token, dispatch]);

    return {
      ...chatState,
      hasUser: !!chatState.currentUser,
      isAvailable: !!chatState.currentUser,
      connected,
      toggleChat: handleToggleChat,
      openChat: handleOpenChat,
      closeChat: handleCloseChat,
      selectChat: handleSelectChat,
      backToInbox: handleBackToInbox,
      setInputText: handleSetInputText,
      setSelectedFile: handleSetSelectedFile,
      clearSelectedFile: handleClearSelectedFile,
      sendMessage: handleSendMessage,
      addChat: handleAddChat,
      removeChat: handleRemoveChat,
      markAsRead: handleMarkAsRead,
      fetchChatList,
      fetchMessages,
    };
  };