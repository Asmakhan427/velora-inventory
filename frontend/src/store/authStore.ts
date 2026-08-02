import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: number
  username: string
  role: 'ADMIN' | 'STAFF'
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  rememberMe: boolean
  login: (token: string, user: AuthUser, rememberMe: boolean) => void
  logout: () => void
}

const STORAGE_KEY = 'deimos-auth'

/**
 * Remember Me is implemented by choosing which Storage backend receives the
 * persisted blob at write time: sessionStorage (cleared when the tab/browser
 * closes) when unchecked, localStorage (survives restarts) when checked.
 */
const dynamicStorage = {
  getItem: (name: string) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    let remember = true
    try {
      remember = JSON.parse(value)?.state?.rememberMe ?? true
    } catch {
      // keep default
    }
    if (remember) {
      localStorage.setItem(name, value)
      sessionStorage.removeItem(name)
    } else {
      sessionStorage.setItem(name, value)
      localStorage.removeItem(name)
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      rememberMe: true,
      login: (token, user, rememberMe) => set({ token, user, rememberMe }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: {
        getItem: (name) => {
          const value = dynamicStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => dynamicStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => dynamicStorage.removeItem(name),
      },
    },
  ),
)

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token)
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN')
