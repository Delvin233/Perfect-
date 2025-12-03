import { createStorage } from "wagmi";

// Create a no-op storage for SSR
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Use real localStorage only on client side
export const storage = createStorage({
  storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
});
