import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  color: "red",
  logo: "/website/assets/images/logo/logo.png",
  isLoading: true,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig: (state, action) => {
      const newState = {
        ...state,
        color: action.payload.themeColor,
        logo: action.payload.logo,
        isLoading: false,
      };
      return newState;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
