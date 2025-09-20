// hooks/useChat.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
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
} from '../store/chat';

export const useChat = () => {
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);

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
  }, [dispatch, chatState.currentUser]);

  const handleBackToInbox = useCallback(() => {
    dispatch(backToInbox());
  }, [dispatch]);

  const handleSetInputText = useCallback((text) => {
    if (!chatState.currentUser) return;
    dispatch(setInputText(text));
  }, [dispatch, chatState.currentUser]);

  const handleSetSelectedFile = useCallback((file) => {
    if (!chatState.currentUser) return;
    dispatch(setSelectedFile(file));
  }, [dispatch, chatState.currentUser]);

  const handleClearSelectedFile = useCallback(() => {
    dispatch(clearSelectedFile());
  }, [dispatch]);

  const handleSendMessage = useCallback((content, chatId) => {
    if (!chatState.currentUser) return;
    
    dispatch(sendMessage({ content, chatId }));
    
    // Simulate bot response
    setTimeout(() => {
      const chat = Object.values(chatState.chats).find(c => c.id === chatId);
      const botMessage = {
        text: `Thanks, ${chat?.name}! ${
          content.media
            ? content.text
              ? `Received your ${content.media.type} and message: "${content.text}"`
              : `Received your ${content.media.type}. Looks great!`
            : 'Thanks for your message!'
        }`,
        sender: 'bot',
        chatId,
      };
      dispatch(addMessage({ chatId, message: botMessage }));
    }, 1000);
  }, [dispatch, chatState.chats, chatState.currentUser]);

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
  }, [dispatch]);

  return {
    ...chatState,
    hasUser: !!chatState.currentUser,
    isAvailable: !!chatState.currentUser,
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
  };
};