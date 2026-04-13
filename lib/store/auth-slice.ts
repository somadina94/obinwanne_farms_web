import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "@/lib/types";

export interface AuthState {
  user: User | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  hydrated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { setUser, setHydrated, logout } = authSlice.actions;
