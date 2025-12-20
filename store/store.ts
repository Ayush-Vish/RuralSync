import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiService } from "../lib/api-service"
import { User } from "@/types"

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  fetchUserProfile: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void> // Modified
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
          
          // The login response usually contains user data now
          // If not, we fetch fresh details
          const userDetails = await apiService.getUserDetails()
          console.log("Logged in user details:", userDetails)
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
        // Clear tokens from cookies/localStorage
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.removeItem("auth-storage");
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          await apiService.register(userData)
          set({ isLoading: false, error: null })
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
          console.log("Fetched user profile:", userDetails)
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

      // 2. Updated to use the correct endpoint name 'updateClientProfile'
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null })

          // Call the refactored 'client' endpoint instead of 'customer'
          const response = await apiService.updateClientProfile(profileData)

          set({
            user: { ...get().user, ...response.data }, // Ensure we merge with new data
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
          set({ isLoading: false, error: null })
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
          console.log("Checking authentication status...")
          const userDetails = await apiService.getUserDetails()
          console.log("Auth check user details:", userDetails)
          const data = await userDetails.data;
          set({
            user: data,
            isLoggedIn: true,
            isLoading: false,
          })
          return true
        } catch (error) {
          set({ user: null, isLoggedIn: false, isLoading: false })
          return false
        }
      },

      initializeAuth: async () => {
        const state = get()
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
