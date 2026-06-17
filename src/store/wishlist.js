import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve ID whether value is a populated object or a plain string
// ─────────────────────────────────────────────────────────────────────────────
const resolveId = (val) => val?._id || val || null;

// Unique key per product+variant combo
export const getWishlistItemKey = (productId, variantId) => {
  const pId = resolveId(productId);
  const vId = resolveId(variantId);
  return vId ? `${pId}-${vId}` : pId;
};

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.token) {
      const res = await axiosInstance.get("/e-commerce/wishlist", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("wishlist");
      return local ? JSON.parse(local) : [];
    }
    return [];
  }
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async ({ product, variantId }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);

    if (auth.token) {
      const res = await axiosInstance.post(
        "/e-commerce/wishlist/toggle",
        { productId: product._id, variantId: vId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Return normalized items from API
      return res.data.data?.items || [];
    }

    // ── Guest / localStorage fallback ──
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("wishlist");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === product._id &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items.splice(idx, 1);
      } else {
        items.push({ productId: product, variantId: vId });
      }
      localStorage.setItem("wishlist", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    loadingIds: [], // per-item loading – prevents spam clicks
  },
  reducers: {},
  extraReducers: (builder) => {
    // ── Fetch ──
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = (action.payload || []).filter(
          (item) => item?.productId && item?.productId !== null
        );
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.loading = false;
      });

    // ── Toggle ──
    builder
      .addCase(toggleWishlistItem.pending, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getWishlistItemKey(product._id, vId);

        // Guard: ignore if already processing this item
        if (state.loadingIds.includes(key)) return;
        state.loadingIds.push(key);

        // Optimistic toggle
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items.splice(idx, 1); // was wishlisted → remove
        } else {
          state.items.push({ productId: product, variantId: vId }); // add
        }
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getWishlistItemKey(product._id, vId);

        state.items = (action.payload || []).filter(
          (item) => item?.productId && item?.productId !== null
        );

        state.loadingIds = state.loadingIds.filter(
          (id) => id !== key
        );
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getWishlistItemKey(product._id, vId);

        // Rollback: undo the optimistic toggle
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items.splice(idx, 1); // was optimistically added → remove
        } else {
          state.items.push({ productId: product, variantId: vId }); // was optimistically removed → re-add
        }
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      });
  },
});

export default wishlistSlice.reducer;
