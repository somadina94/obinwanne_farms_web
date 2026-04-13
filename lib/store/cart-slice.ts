import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CartItem } from "@/lib/types";

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{
        productId: string;
        title: string;
        priceNgn: number;
        type: "digital" | "physical";
        image?: string;
        quantity?: number;
      }>,
    ) {
      const q = action.payload.quantity ?? 1;
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity += q;
      } else {
        state.items.push({
          productId: action.payload.productId,
          title: action.payload.title,
          priceNgn: action.payload.priceNgn,
          type: action.payload.type,
          image: action.payload.image,
          quantity: q,
        });
      }
    },
    setQty(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, setQty, removeItem, clearCart } = cartSlice.actions;
