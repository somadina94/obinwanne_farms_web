import { getCookie } from "cookies-next/client";

import { API_URL, COOKIE_TOKEN } from "@/lib/constants";

function getTokenFromBrowser(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = getCookie(COOKIE_TOKEN);
  return typeof v === "string" ? v : undefined;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type Opts = RequestInit & { token?: string | null; skipAuth?: boolean };

export async function apiFetch<T>(
  path: string,
  options: Opts = {},
): Promise<T> {
  const { token, skipAuth, headers: hdr, ...rest } = options;
  const headers = new Headers(hdr);
  if (!headers.has("Content-Type") && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const auth = token === null ? undefined : token ?? getTokenFromBrowser();
  if (auth && !skipAuth) {
    headers.set("Authorization", `Bearer ${auth}`);
  }

  const url = `${API_URL}${path}`;
  const fetchInit: RequestInit = { ...rest, headers, credentials: "omit" };
  if (
    !fetchInit.signal &&
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    fetchInit.signal = AbortSignal.timeout(45_000);
  }

  let res: Response;
  try {
    res = await fetch(url, fetchInit);
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "AbortError") {
      throw new ApiError("Request timed out — is the API running?", 0);
    }
    throw e;
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : res.statusText;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}
