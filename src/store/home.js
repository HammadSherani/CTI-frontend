import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/config/axiosInstance';
import { baseUrl, getConfig } from './slicer';
import { HOMEPAGE_API } from './apiRoutes';

export const fetchHome = createAsyncThunk(
  'home/fetchHome',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(baseUrl + HOMEPAGE_API, getConfig());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch home data');
    }
  }
);

const initialState = {
  homeData: null,
  categories: [],
  banners: [],
  blogs: [],
  reviews: [],
  repairmans: [],
  services: [],
  heroSlides: [],
  loading: false,
  error: null,
  lastFetched: null 
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    clearHomeData: (state) => {
      state.homeData = null;
      state.categories = [];
      state.banners = [];
      state.blogs = [];
      state.reviews = [];
      state.repairmans = [];
      state.services = [];
      state.heroSlides = [];
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHome.fulfilled, (state, action) => {
        state.loading = false;
        state.homeData = action.payload;
        state.categories = action.payload.categories || [];
        state.banners = action.payload.banners || [];
        state.blogs = action.payload.blogs || [];
        state.reviews = action.payload.reviews || [];
        state.repairmans = action.payload.repairmen || [];
        state.services = action.payload.services || [];
        state.heroSlides = action.payload.banners || [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchHome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearHomeData } = homeSlice.actions;
export default homeSlice.reducer;