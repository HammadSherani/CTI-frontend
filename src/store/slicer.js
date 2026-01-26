import { createSlice } from "@reduxjs/toolkit";

export const baseUrl = "http://192.168.1.30:5000/api";


export const getConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getConfigFormData = () => ({
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const initialState = {
  isLoading: false,
  isError: false,
};

const Slicer = createSlice({
  name: "slicer",

  initialState,
  reducers: {},
});
export const {} = Slicer.actions;
export default Slicer.reducer;
