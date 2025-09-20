import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
// import chatReducer from "./chat"

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

export default store;
