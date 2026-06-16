import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve ID whether value is a populated object or a plain string
// ─────────────────────────────────────────────────────────────────────────────
const resolveId = (val) => val?._id || val || null;

// Unique key per product+variant combo (same convention as wishlist)
export const getCartItemKey = (productId, variantId) => {
  const pId = resolveId(productId);
  const vId = resolveId(variantId);
  return vId ? `${pId}-${vId}` : pId;
};

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.token) {
      try {
        const res = await axiosInstance.get("/e-commerce/cart/my-cart", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        return res.data.data?.items || [];
      } catch {
        return [];
      }
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("cart");
      return local ? JSON.parse(local) : [];
    }
    return [];
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product, variantId, quantity = 1 }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    if (auth.token) {
      const res = await axiosInstance.post(
        "/e-commerce/cart/my-cart/items",
        { productId: product._id, variantId: vId, quantity },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("cart");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === product._id &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items[idx].quantity += quantity;
      } else {
        items.push({ productId: product, variantId: vId, quantity });
      }
      localStorage.setItem("cart", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ product, variantId, delta }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    if (auth.token) {
      const res = await axiosInstance.put(
        "/e-commerce/cart/my-cart/items",
        { productId: product._id, variantId: vId, delta },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("cart");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === product._id &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items[idx].quantity = Math.max(1, items[idx].quantity + delta);
        localStorage.setItem("cart", JSON.stringify(items));
      }
      return items;
    }
    return [];
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async ({ product, variantId }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    if (auth.token) {
      const res = await axiosInstance.delete("/e-commerce/cart/my-cart/items", {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { productId: product._id, variantId: vId },
      });
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("cart");
      let items = local ? JSON.parse(local) : [];
      items = items.filter(
        (i) =>
          !(
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
          )
      );
      localStorage.setItem("cart", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

// ── Unified toggle: add if absent, remove if present ──────────────────────────
export const toggleCart = createAsyncThunk(
  "cart/toggle",
  async ({ product, variantId, quantity = 1 }, { getState, dispatch }) => {
    const { cart } = getState();
    const vId = resolveId(variantId);
    const alreadyInCart = cart.items.some(
      (i) =>
        resolveId(i.productId) === product._id &&
        resolveId(i.variantId) === vId
    );
    if (alreadyInCart) {
      return dispatch(removeFromCart({ product, variantId: vId })).unwrap();
    } else {
      return dispatch(addToCart({ product, variantId: vId, quantity })).unwrap();
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    loadingIds: [], // per-item loading – prevents spam clicks
  },
  reducers: {},
  extraReducers: (builder) => {
    // ── Fetch ──
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });

    // ── Add to Cart ──
    builder
      .addCase(addToCart.pending, (state, action) => {
        const { product, variantId, quantity = 1 } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);

        // Optimistic add
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity += quantity;
        } else {
          state.items.push({ productId: product, variantId: vId, quantity });
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(addToCart.rejected, (state, action) => {
        // Rollback optimistic add
        const { product, variantId, quantity = 1 } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity -= quantity;
          if (state.items[idx].quantity <= 0) state.items.splice(idx, 1);
        }
      });

    // ── Update Cart Item ──
    builder
      .addCase(updateCartItem.pending, (state, action) => {
        const { product, variantId, delta } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity = Math.max(
            1,
            state.items[idx].quantity + delta
          );
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        // Rollback optimistic qty change
        const { product, variantId, delta } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity = Math.max(
            1,
            state.items[idx].quantity - delta
          );
        }
      });

    // ── Remove from Cart ──
    builder
      .addCase(removeFromCart.pending, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);

        // Stash removed item for rollback, then remove optimistically
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === product._id &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          // Store snapshot on action for rollback in rejected
          action.meta.removedItem = state.items[idx];
          state.items.splice(idx, 1);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        // Rollback: re-insert removed item
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const key = getCartItemKey(product._id, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        if (action.meta.removedItem) {
          state.items.push(action.meta.removedItem);
        }
      });
  },
});

export default cartSlice.reducer;
