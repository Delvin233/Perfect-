import { createStorage } from 'wagmi'

// Create a no-op storage for SSR
const noopStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
}

// Use real localStorage only on client side
export const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
})
