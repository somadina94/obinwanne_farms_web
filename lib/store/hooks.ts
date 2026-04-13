"use client";

import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import type { AppDispatch, RootState } from "@/lib/store/index";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
