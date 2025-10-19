import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  unreadCount: 0,
  isLoading: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.isLoading = false;
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload); // Latest first
      if (!action.payload.isRead) state.unreadCount++;
    },
    markAsRead: (state, action) => {
      const notification = state.list.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount--;
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  setLoading 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;