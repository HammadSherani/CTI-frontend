import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
// import chatReducer from "./chat"

// store/index.js mein add karo
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

// Development mein store expose karo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.store = store;
}

export default store;