"use client";

import { deleteCookie, getCookie, setCookie } from "cookies-next/client";

import { COOKIE_ROLE, COOKIE_TOKEN } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

const TOKEN_MAX_AGE = 60 * 60 * 24 * 89; // align with JWT ~90d

export function setAuthCookies(token: string, role: UserRole) {
  setCookie(COOKIE_TOKEN, token, {
    maxAge: TOKEN_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  setCookie(COOKIE_ROLE, role, {
    maxAge: TOKEN_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function clearAuthCookies() {
  deleteCookie(COOKIE_TOKEN, { path: "/" });
  deleteCookie(COOKIE_ROLE, { path: "/" });
}

export function getTokenFromCookie(): string | undefined {
  const v = getCookie(COOKIE_TOKEN);
  return typeof v === "string" ? v : undefined;
}
