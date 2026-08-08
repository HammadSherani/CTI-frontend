import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

const resolveId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val._id || val.id || null;
};

export const getCartItemKey = (productId, variantId) => {
  const pId = resolveId(productId);
  const vId = resolveId(variantId);
  return vId ? `${pId}-${vId}` : pId;
};

export const fetchRefurbishedCart = createAsyncThunk(
  "refurbishedCart/fetch",
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.token) {
      try {
        const res = await axiosInstance.get("/refurbished/cart/my-cart", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        return { items: res.data.data?.items || [], cartId: res.data.data?._id || null };
      } catch {
        return { items: [], cartId: null };
      }
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_cart");
      return { items: local ? JSON.parse(local) : [], cartId: null };
    }
    return { items: [], cartId: null };
  }
);

export const addRefurbishedToCart = createAsyncThunk(
  "refurbishedCart/add",
  async ({ product, variantId, quantity = 1 }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    const pId = resolveId(product);
    if (auth.token) {
      const res = await axiosInstance.post(
        "/refurbished/cart/my-cart/items",
        { productId: pId, variantId: vId, quantity },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_cart");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === pId &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items[idx].quantity += quantity;
      } else {
        const productWithId = { ...product, _id: pId };
        items.push({ productId: productWithId, variantId: vId, quantity });
      }
      localStorage.setItem("refurbished_cart", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

export const updateRefurbishedCartItem = createAsyncThunk(
  "refurbishedCart/update",
  async ({ product, variantId, delta }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    const pId = resolveId(product);
    if (auth.token) {
      const res = await axiosInstance.put(
        "/refurbished/cart/my-cart/items",
        { productId: pId, variantId: vId, delta },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_cart");
      let items = local ? JSON.parse(local) : [];
      const idx = items.findIndex(
        (i) =>
          resolveId(i.productId) === pId &&
          resolveId(i.variantId) === vId
      );
      if (idx > -1) {
        items[idx].quantity = Math.max(1, items[idx].quantity + delta);
        localStorage.setItem("refurbished_cart", JSON.stringify(items));
      }
      return items;
    }
    return [];
  }
);

export const removeRefurbishedFromCart = createAsyncThunk(
  "refurbishedCart/remove",
  async ({ product, variantId }, { getState }) => {
    const { auth } = getState();
    const vId = resolveId(variantId);
    const pId = resolveId(product);
    if (auth.token) {
      const res = await axiosInstance.delete("/refurbished/cart/my-cart/items", {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { productId: pId, variantId: vId },
      });
      return res.data.data?.items || [];
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("refurbished_cart");
      let items = local ? JSON.parse(local) : [];
      items = items.filter(
        (i) =>
          !(
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
          )
      );
      localStorage.setItem("refurbished_cart", JSON.stringify(items));
      return items;
    }
    return [];
  }
);

const refurbishedCartSlice = createSlice({
  name: "refurbishedCart",
  initialState: {
    items: [],
    cartId: null,
    loading: false,
    loadingIds: [],
  },
  reducers: {
    clearRefurbishedCart: (state) => {
      state.items = [];
      state.cartId = null;
      state.loadingIds = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("refurbished_cart");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRefurbishedCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRefurbishedCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.cartId = action.payload.cartId;
        state.loading = false;
      })
      .addCase(fetchRefurbishedCart.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addRefurbishedToCart.pending, (state, action) => {
        const { product, variantId, quantity = 1 } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);

        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity += quantity;
        } else {
          state.items.push({ productId: product, variantId: vId, quantity });
        }
      })
      .addCase(addRefurbishedToCart.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(addRefurbishedToCart.rejected, (state, action) => {
        const { product, variantId, quantity = 1 } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity -= quantity;
          if (state.items[idx].quantity <= 0) state.items.splice(idx, 1);
        }
      });

    builder
      .addCase(updateRefurbishedCartItem.pending, (state, action) => {
        const { product, variantId, delta } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity = Math.max(1, state.items[idx].quantity + delta);
        }
      })
      .addCase(updateRefurbishedCartItem.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(updateRefurbishedCartItem.rejected, (state, action) => {
        const { product, variantId, delta } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          state.items[idx].quantity = Math.max(1, state.items[idx].quantity - delta);
        }
      });

    builder
      .addCase(removeRefurbishedFromCart.pending, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        if (!state.loadingIds.includes(key)) state.loadingIds.push(key);

        const idx = state.items.findIndex(
          (i) =>
            resolveId(i.productId) === pId &&
            resolveId(i.variantId) === vId
        );
        if (idx > -1) {
          action.meta.removedItem = state.items[idx];
          state.items.splice(idx, 1);
        }
      })
      .addCase(removeRefurbishedFromCart.fulfilled, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.items = action.payload;
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
      })
      .addCase(removeRefurbishedFromCart.rejected, (state, action) => {
        const { product, variantId } = action.meta.arg;
        const vId = resolveId(variantId);
        const pId = resolveId(product);
        const key = getCartItemKey(pId, vId);
        state.loadingIds = state.loadingIds.filter((id) => id !== key);
        if (action.meta.removedItem) {
          state.items.push(action.meta.removedItem);
        }
      });
  },
});

export const { clearRefurbishedCart } = refurbishedCartSlice.actions;
export default refurbishedCartSlice.reducer;

