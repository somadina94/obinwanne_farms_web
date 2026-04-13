"use client";

import { useEffect } from "react";

import { ApiError } from "@/lib/api/client";
import { clearAuthCookies, getTokenFromCookie } from "@/lib/auth-cookies";
import { getMe } from "@/lib/api/services";
import { useAppDispatch } from "@/lib/store/hooks";
import { logout, setHydrated, setUser } from "@/lib/store/auth-slice";

export function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    const token = getTokenFromCookie();
    if (!token) {
      dispatch(setHydrated(true));
      return;
    }
    getMe(token)
      .then((res) => {
        if (!cancelled) dispatch(setUser(res.data.user));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Only drop the session when the API rejects the token. Network/CORS/5xx should not
        // wipe redux-persist + cookies — that felt like "reload logs me out" when the API was
        // briefly unreachable or misconfigured.
        if (e instanceof ApiError && e.status === 401) {
          clearAuthCookies();
          dispatch(logout());
        }
      })
      .finally(() => {
        if (!cancelled) dispatch(setHydrated(true));
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
