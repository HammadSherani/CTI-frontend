
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";
import { baseUrl, getConfig } from "./slicer";
import { GET_ACADEMIC_CATEGORYID_API, GET_ACADEMY_CONTENT_API, GET_CONTENT_DETAILS_API, } from "./apiRoutes";
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

export const fetchSubCategory = createAsyncThunk(
  "Academy/subcategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const params = {};
      if (categoryId && categoryId !== 'all') params.categoryId = categoryId;
      const response = await axiosInstance.get(
        `${baseUrl}/academic/subcategory`,
        { params, ...getConfig() }
      );
      return response.data;
    } catch (err) {
      handleError(err);
      return rejectWithValue(err?.response?.data || err?.message || "Something went wrong");
    }
  }
);

export const fetchAcademicData = createAsyncThunk(
  "Academy/data",
  async ({ page = 1, limit = 10, categoryId = "all", search = "", subCategoryId = "all", sort = "recent" }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (subCategoryId && subCategoryId !== 'all') params.subCategoryId = subCategoryId;
      if (sort && sort !== 'recent') params.sort = sort;
      const response = await axiosInstance.get(
        `${baseUrl}${GET_ACADEMY_CONTENT_API}/${categoryId}`,
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


export const fetchCourseDetails= createAsyncThunk(
  "Academy/courseDetails",
  async ( slug , { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(baseUrl + GET_CONTENT_DETAILS_API + `/${slug}`,  getConfig());
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
  isLoading: true,
  isError: false,
  isSuccess: false,
  academicCategories: null,
  academicSubCategories: null,
  academicData: null,
  courseDetails: null
};

const academySlice = createSlice({
  name: "academy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategory.pending, (state) => {
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.academicCategories = action.payload.data;
      })
      .addCase(fetchCategory.rejected, (state) => {
        state.isError = true;
        state.isSuccess = false;
      });

    builder
      .addCase(fetchSubCategory.pending, (state) => {
        state.academicSubCategories = null;
      })
      .addCase(fetchSubCategory.fulfilled, (state, action) => {
        state.academicSubCategories = action.payload.data;
      })
      .addCase(fetchSubCategory.rejected, (state) => {
        state.academicSubCategories = [];
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
        state.academicData = action.payload;
      })
      .addCase(fetchAcademicData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });

    builder
      .addCase(fetchCourseDetails.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courseDetails = action.payload.data;
      })
      .addCase(fetchCourseDetails.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  }
});

export default academySlice.reducer;