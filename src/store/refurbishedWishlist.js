import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

const resolveId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val._id || val.id || null;
};

export const getWishlistItemKey = (productId, variantId) => {
  const pId = resolveId(productId);
  const vId = resolveId(variantId);
  return vId ? `${pId}-${vId}` : pId;
};

export const fetchRefurbishedWishlist = createAsyncThunk(
  "refurbishedWishlist/fetch",
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.token) {
      const res = await axiosInstance.get("/refurbished/wishlist", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_wishlist");
      return local ? JSON.parse(local) : [];
    }
    return [];
  }
);

export const toggleRefurbishedWishlistItem = createAsyncThunk(
  "refurbishedWishlist/toggle",
  async ({ product, variantId }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    const pId = resolveId(product);

    if (auth.token) {
      const res = await axiosInstance.post(
        "/refurbished/wishlist/toggle",
        { productId: pId, variantId: vId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return res.data.data?.items || [];
    }

    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_wishlist");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === pId &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items.splice(idx, 1);
      } else {
        const productWithId = { ...product, _id: pId };
        items.push({ productId: productWithId, variantId: vId });
      }
      localStorage.setItem("refurbished_wishlist", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

const refurbishedWishlistSlice = createSlice({
  name: "refurbishedWishlist",
  initialState: {
    items: [],
    loading: false,
    loadingIds: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRefurbishedWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRefurbishedWishlist.fulfilled, (state, action) => {
        state.items = (action.payload || []).filter(
          (item) => item?.productId && item?.productId !== null
        );
        state.loading = false;
      })
      .addCase(fetchRefurbishedWishlist.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(toggleRefurbishedWishlistItem.pending, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getWishlistItemKey(pId, vId);

        if (state.loadingIds.includes(key)) return;
        state.loadingIds.push(key);

        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items.splice(idx, 1);
        } else {
          state.items.push({ productId: product, variantId: vId });
        }
      })
      .addCase(toggleRefurbishedWishlistItem.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getWishlistItemKey(pId, vId);

        state.items = (action.payload || []).filter(
          (item) => item?.productId && item?.productId !== null
        );

        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(toggleRefurbishedWishlistItem.rejected, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getWishlistItemKey(pId, vId);

        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items.splice(idx, 1);
        } else {
          state.items.push({ productId: product, variantId: vId });
        }
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      });
  },
});

export default refurbishedWishlistSlice.reducer;

