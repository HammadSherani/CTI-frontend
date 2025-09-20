import { store } from '../store';
import { 
  setCurrentUser, 
  loadUserChats, 
  setUserOnline, 
  setUserOffline,
  addMessage 
} from '../store/chatSlice';

class ChatService {
  constructor() {
    this.socket = null;
    this.currentUser = null;
  }

  // Initialize chat service with user
  async initializeUser(user) {
    this.currentUser = user;
    store.dispatch(setCurrentUser(user));
    
    // Load user's chats from API/localStorage
    const userData = await this.loadUserData(user.id);
    store.dispatch(loadUserChats(userData));
    
    // Connect to websocket for real-time updates
    this.connectWebSocket(user.id);
  }

  // Load user data from API or localStorage
  async loadUserData(userId) {
    try {
      // Try to load from API first
      const response = await fetch(`/api/users/${userId}/chats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to load from API:', error);
    }

    // Fallback to localStorage
    const localData = localStorage.getItem(`chat_data_${userId}`);
    return localData ? JSON.parse(localData) : { chats: {}, messages: {}, unreadCounts: {} };
  }

  // Save user data to localStorage
  saveUserData() {
    if (!this.currentUser) return;
    
    const state = store.getState().chat;
    const userData = {
      chats: state.chats,
      messages: state.messages,
      unreadCounts: state.unreadCounts,
    };
    
    localStorage.setItem(`chat_data_${this.currentUser.id}`, JSON.stringify(userData));
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket(userId) {
    // Replace with your actual WebSocket URL
    this.socket = new WebSocket(`ws://localhost:3001/chat?userId=${userId}`);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          store.dispatch(addMessage({ 
            chatId: data.chatId, 
            message: data.message 
          }));
          break;
        case 'user_online':
          store.dispatch(setUserOnline(data.userId));
          break;
        case 'user_offline':
          store.dispatch(setUserOffline(data.userId));
          break;
      }
    };
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.saveUserData();
  }

  // Send message via API/WebSocket
  async sendMessageToServer(chatId, content) {
    try {
      const response = await fetch('/api/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          content,
          userId: this.currentUser.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message to server:', error);
    }
  }
}

export const chatService = new ChatService();