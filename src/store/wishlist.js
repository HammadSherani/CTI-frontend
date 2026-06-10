import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { getState }) => {
  const { auth } = getState();
  if (auth.token) {
    const res = await axiosInstance.get("/e-commerce/wishlist", {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    return res.data.data?.items || [];
  }
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("wishlist");
    return local ? JSON.parse(local) : [];
  }
  return [];
});

export const toggleWishlistItem = createAsyncThunk("wishlist/toggle", async ({ product, variantId }, { getState }) => {
  const { auth } = getState();
  const vId = variantId?._id || variantId;
  if (auth.token) {
    const res = await axiosInstance.post("/e-commerce/wishlist/toggle", 
      { productId: product._id, variantId: vId },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    return res.data.data?.items || [];
  }
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("wishlist");
    let items = local ? JSON.parse(local) : [];
    const idx = items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
    if (idx > -1) {
      items.splice(idx, 1);
    } else {
      items.push({ productId: product, variantId: vId });
    }
    localStorage.setItem("wishlist", JSON.stringify(items));
    return items;
  }
  return [];
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchWishlist.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(toggleWishlistItem.pending, (state, action) => {
      // Optimistic update
      const { product, variantId } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push({ productId: product, variantId: vId });
      }
    });
    builder.addCase(toggleWishlistItem.fulfilled, (state, action) => {
      // Final state from API
      state.items = action.payload;
    });
    builder.addCase(toggleWishlistItem.rejected, (state, action) => {
      // Revert optimistic update on error
      const { product, variantId } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push({ productId: product, variantId: vId });
      }
    });
  }
});

export default wishlistSlice.reducer;
