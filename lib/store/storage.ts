import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/** Async noop — used during SSR so redux-persist never touches `localStorage` on the server. */
const noopStorage = {
  getItem(): Promise<null> {
    return Promise.resolve(null);
  },
  setItem(): Promise<void> {
    return Promise.resolve();
  },
  removeItem(): Promise<void> {
    return Promise.resolve();
  },
};

/**
 * Do not import `redux-persist/lib/storage` directly — it runs `getStorage()` at module load
 * and logs "failed to create sync storage" when `window.localStorage` is missing (SSR).
 */
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : noopStorage;

export default storage;
