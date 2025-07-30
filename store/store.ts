import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiService } from "../lib/api-service"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: {
    name: string
    email: string
    password: string
    phone: string
    address: string
    role: string
  }) => Promise<void>
  fetchUserProfile: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkAuthStatus: () => Promise<boolean>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await apiService.login(email, password)

          // Fetch user details after successful login
          const userDetails = await apiService.getUserDetails()

          set({
            user: userDetails,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Invalid email or password. Please try again.",
            isLoading: false,
            isLoggedIn: false,
            user: null,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          error: null,
        })
        // Clear any stored tokens/cookies if needed
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null })

          await apiService.register(userData)

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Registration failed. Please try again.",
            isLoading: false,
          })
          throw error
        }
      },

      fetchUserProfile: async () => {
        try {
          set({ isLoading: true, error: null })

          const userDetails = await apiService.getUserDetails()

          set({
            user: userDetails,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Failed to fetch user profile",
            isLoading: false,
            isLoggedIn: false,
            user: null,
          })
          throw error
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null })

          const updatedProfile = await apiService.updateCustomerProfile(profileData)

          set({
            user: { ...get().user, ...updatedProfile },
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Failed to update profile",
            isLoading: false,
          })
          throw error
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null })

          await apiService.changePassword(passwordData)

          set({
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: "Failed to change password",
            isLoading: false,
          })
          throw error
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      checkAuthStatus: async () => {
        try {
          set({ isLoading: true })

          const userDetails = await apiService.getUserDetails()

          set({
            user: userDetails,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          set({
            user: null,
            isLoggedIn: false,
            isLoading: false,
            error: null,
          })

          return false
        }
      },

      initializeAuth: async () => {
        const state = get()

        // If we already have user data from persistence, verify it's still valid
        if (state.user && state.isLoggedIn) {
          await get().checkAuthStatus()
        } else {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
)
