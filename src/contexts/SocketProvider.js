// contexts/SocketProvider.js
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setUserOnline, setUserOffline, markChatAsRead, updateChatList } from '../store/chat';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && user) {
      console.log('Connecting socket for user:', user.name);

      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        newSocket.emit('user_online');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('connected', (data) => {
        console.log('Server confirmation:', data);
      });

      newSocket.on('new_message', (messageData) => {
        console.log('=== Socket Message Debug ===');
        console.log('Raw messageData:', messageData);
        console.log('messageType:', messageData.messageType);
        console.log('quotationData:', messageData.quotationData); 

        dispatch(addMessage({
          chatId: messageData.chatId,
          message: {
            _id: messageData.messageId,
            messageId: messageData.messageId,
            content: messageData.content,
            messageType: messageData.messageType,
            senderType: messageData.senderType,
            senderId: messageData.senderId,
            timestamp: messageData.timestamp,
            mediaUrl: messageData.mediaUrl,
            fileName: messageData.fileName,
            quotationId: messageData.quotationId,        
            quotationData: messageData.quotationData,   
            status: 'delivered',
            user: {
              _id: messageData.senderId,
              name: messageData.senderName,
              avatar: messageData.senderAvatar,
              role: messageData.senderType
            }
          }
        }));
      });

      // ⭐ NEW EVENT LISTENER - Handle chat list updates
      newSocket.on('chat_list_updated', (data) => {
        console.log('🔥 Chat list updated:', data);
        dispatch(updateChatList(data));
      });

      newSocket.on('chat_joined', (data) => {
        console.log('Successfully joined chat:', data.chatId);
        console.log('Chat info:', data.chatInfo);
      });

      newSocket.on('chat_error', (error) => {
        console.error('Chat error received:', error);
      });

      newSocket.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
      });

      newSocket.on('messages_read', (data) => {
        console.log('Messages marked as read:', data);
        dispatch(markChatAsRead(data.chatId));
      });

      newSocket.on('user_online', (data) => {
        console.log('User came online:', data);
        dispatch(setUserOnline(data.userId));
      });

      newSocket.on('user_offline', (data) => {
        console.log('User went offline:', data);
        dispatch(setUserOffline(data.userId));
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      newSocket.onAny((eventName, ...args) => {
        console.log('🔥 Socket Event Received:', eventName, args);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [token, user, dispatch]);

  const value = {
    socket,
    connected,
    joinChat: (chatId) => {
      if (socket && connected) {
        console.log('🔥 Emitting join_chat for chatId:', chatId);
        socket.emit('join_chat', { chatId });
      } else {
        console.warn('Cannot join chat - socket not connected:', { socket: !!socket, connected });
      }
    },
    leaveChat: (chatId) => {
      if (socket && connected) {
        console.log('Leaving chat:', chatId);
        socket.emit('leave_chat', { chatId });
      }
    },
    sendMessage: (chatId, content, messageType = 'text', mediaUrl = null, fileName = null, fileSize = null) => {
      if (socket && connected) {
        console.log('Sending message:', { chatId, content, messageType });
        socket.emit('send_message', {
          chatId,
          content,
          messageType,
          mediaUrl,
          fileName,
          fileSize
        });
      } else {
        console.warn('Cannot send message - socket not connected');
      }
    },
    markMessagesRead: (chatId, messageIds) => {
      if (socket && connected) {
        console.log('Marking messages as read:', { chatId, messageIds });
        socket.emit('mark_messages_read', { chatId, messageIds });
      }
    },
    startTyping: (chatId) => {
      if (socket && connected) {
        socket.emit('typing_start', { chatId });
      }
    },
    stopTyping: (chatId) => {
      if (socket && connected) {
        socket.emit('typing_stop', { chatId });
      }
    }
  };

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