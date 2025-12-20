"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/store"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isLoggedIn, isLoading, checkAuthStatus } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth) {
      // Always check auth status when AuthGuard mounts
      checkAuthStatus().then((isAuthenticated) => {
        if (!isAuthenticated) {
          router.push("/login")
        }
      })
    }
  }, [requireAuth, router, checkAuthStatus])

  // Show loading while checking authentication
  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
