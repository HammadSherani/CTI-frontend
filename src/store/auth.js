import { createSlice } from "@reduxjs/toolkit";

const isClient = typeof window !== "undefined";

const loadAuthState = () => {
  if (!isClient) return null;
  try {
    const serializedState = localStorage.getItem("auth");
    return serializedState ? JSON.parse(serializedState) : null;
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
    return null;
  }
};

const saveAuthState = (state) => {
  if (!isClient) return;
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("auth", serializedState);
  } catch (error) {
    console.error("Error saving auth state to localStorage:", error);
  }
};

// 🔹 Define logic for profile completeness
const checkProfileComplete = (user) => {
  if (!user) return false;

  // Example: require name, email, and profilePhoto
  return Boolean(user.name && user.email && user.profilePhoto);
};

const initialState = loadAuthState() || {
  user: null,
  userType: null,
  token: null,
  isProfileComplete: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const newState = {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        token: action.payload.token,
        isProfileComplete: checkProfileComplete(action.payload.user),
      };
      saveAuthState(newState);
      return newState;
    },
    setUser: (state, action) => {
      const newState = {
        ...state,
        user: action.payload,
        isProfileComplete: checkProfileComplete(action.payload),
      };
      saveAuthState(newState);
      return newState;
    },
     setProfileComplete: (state, action) => {
      const newState = {
        ...state,
        isProfileComplete: action.payload, // true / false
      };
      saveAuthState(newState);
      return newState;
    },
    clearAuth: () => {
      const newState = {
        user: null,
        userType: null,
        token: null,
        isProfileComplete: false,
      };
      saveAuthState(newState);
      return newState;
    },
  },
});

export const { setAuth, clearAuth, setUser, setProfileComplete } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
