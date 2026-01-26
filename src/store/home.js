
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";
import { baseUrl, getConfig } from "./slicer";
import { HOMEPAGE_API } from "./apiRoutes";
import handleError from "@/helper/handleError";

export const fetchHome = createAsyncThunk(
  "home/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(baseUrl + HOMEPAGE_API, getConfig());
      return response.data;
    } catch (err) {
      handleError(err);
      const payload = err?.response?.data || err?.message || "Something went wrong";
      return rejectWithValue(payload);
    }
  }
);

const initialState = {
  data: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  heroSlides: null,
  services: null,
  reviews: null,
  blogs: null,
  categories: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHome.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchHome.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload;
        state.heroSlides = action.payload.data.banners;
        state.services = action.payload.data.services;
        state.reviews = action.payload.data.reviews;
        state.categories = action.payload.data.categories;
        state.blogs=action.payload.data.blogs;
      })
      .addCase(fetchHome.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export default homeSlice.reducer;
export const {} = homeSlice.actions;
export { fetchHome };
