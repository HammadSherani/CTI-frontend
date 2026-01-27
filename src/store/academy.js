
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";
import { baseUrl, getConfig } from "./slicer";
import { GET_ACADEMIC_CATEGORYID_API, GET_ACADEMY_BY_CATEGORYID_API, HOMEPAGE_API } from "./apiRoutes";
import handleError from "@/helper/handleError";

export const fetchCategory= createAsyncThunk(
  "Academy/category",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(baseUrl + GET_ACADEMIC_CATEGORYID_API, getConfig());
      return response.data;
    } catch (err) {
      handleError(err);
      const payload = err?.response?.data || err?.message || "Something went wrong";
      return rejectWithValue(payload);
    }
  }
);


export const fetchAcademicData = createAsyncThunk(
  "Academy/data",
  async ({ page = 1, limit = 10, categoryId = "all", search = "" }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const response = await axiosInstance.get(
        `${baseUrl}/academic/category/${categoryId}`,
        {
          params,
          ...getConfig(),
        }
      );

      return response.data;
    } catch (err) {
      handleError(err);
      return rejectWithValue(
        err?.response?.data || err?.message || "Something went wrong"
      );
    }
  }
);


const initialState = {
  data: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  academicCategories: null,
  academicData: null,
};

const academySlice = createSlice({
  name: "academy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategory.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicCategories = action.payload.data;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
       builder
      .addCase(fetchAcademicData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchAcademicData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.academicData = action.payload.data;
      })
      .addCase(fetchAcademicData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export default academySlice.reducer;