import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axiosInstance";

// Note: Backend Cart routes might need adaptation to support similar populated return structures.
// For now, guest logic stores populated items.

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { getState }) => {
  const { auth } = getState();
  if (auth.token) {
    try {
      const res = await axiosInstance.get("/e-commerce/cart/my-cart", {
        headers: { Authorization: `Bearer ${auth.token}` }
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
});

export const addToCart = createAsyncThunk("cart/add", async ({ product, variantId, quantity = 1 }, { getState }) => {
  const { auth } = getState();
  const vId = variantId?._id || variantId;
  if (auth.token) {
    const res = await axiosInstance.post("/e-commerce/cart/my-cart/items", 
      { productId: product._id, variantId: vId, quantity },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    return res.data.data?.items || [];
  }
  
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("cart");
    let items = local ? JSON.parse(local) : [];
    const idx = items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ productId: product, variantId: vId, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(items));
    return items;
  }
  return [];
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ product, variantId, delta }, { getState }) => {
  const { auth } = getState();
  const vId = variantId?._id || variantId;
  if (auth.token) {
    const res = await axiosInstance.put("/e-commerce/cart/my-cart/items", 
      { productId: product._id, variantId: vId, delta },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    return res.data.data?.items || [];
  }
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("cart");
    let items = local ? JSON.parse(local) : [];
    const idx = items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
    if (idx > -1) {
      items[idx].quantity = Math.max(1, items[idx].quantity + delta);
      localStorage.setItem("cart", JSON.stringify(items));
    }
    return items;
  }
  return [];
});

export const removeFromCart = createAsyncThunk("cart/remove", async ({ product, variantId }, { getState }) => {
  const { auth } = getState();
  const vId = variantId?._id || variantId;
  if (auth.token) {
    const res = await axiosInstance.delete("/e-commerce/cart/my-cart/items", {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { productId: product._id, variantId: vId }
    });
    return res.data.data?.items || [];
  }
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("cart");
    let items = local ? JSON.parse(local) : [];
    items = items.filter(i => !(i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId));
    localStorage.setItem("cart", JSON.stringify(items));
    return items;
  }
  return [];
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchCart.rejected, (state) => {
      state.loading = false;
    });

    // Add to Cart Optimistic
    builder.addCase(addToCart.pending, (state, action) => {
      const { product, variantId, quantity = 1 } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items[idx].quantity += quantity;
      } else {
        state.items.push({ productId: product, variantId: vId, quantity });
      }
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      const { product, variantId, quantity = 1 } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items[idx].quantity -= quantity;
        if (state.items[idx].quantity <= 0) state.items.splice(idx, 1);
      }
    });

    // Update Cart Item Optimistic
    builder.addCase(updateCartItem.pending, (state, action) => {
      const { product, variantId, delta } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items[idx].quantity = Math.max(1, state.items[idx].quantity + delta);
      }
    });
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      const { product, variantId, delta } = action.meta.arg;
      const vId = variantId?._id || variantId;
      const idx = state.items.findIndex(i => i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId);
      if (idx > -1) {
        state.items[idx].quantity = Math.max(1, state.items[idx].quantity - delta);
      }
    });

    // Remove from Cart Optimistic
    builder.addCase(removeFromCart.pending, (state, action) => {
      const { product, variantId } = action.meta.arg;
      const vId = variantId?._id || variantId;
      state.items = state.items.filter(i => !(i.productId._id === product._id && (i.variantId?._id || i.variantId) === vId));
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    // On reject for remove, it's safer to just fetch Cart again if it fails, or not handle it.
  }
});

export default cartSlice.reducer;
