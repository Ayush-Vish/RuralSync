"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/store"

export function Header() {
  const { user, isLoggedIn, isLoading, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <span className="text-xl font-bold text-gray-900">RuralSync</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/services" className="text-gray-600 hover:text-green-600 transition-colors">
            Services
          </Link>
          <Link href="/providers" className="text-gray-600 hover:text-green-600 transition-colors">
            Providers
          </Link>
          {isLoggedIn && (
            <Link href="/bookings" className="text-gray-600 hover:text-green-600 transition-colors">
              My Bookings
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {isLoading ? (
            // Show loading state while checking authentication
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              <div className="w-16 h-8 animate-pulse bg-gray-200 rounded"></div>
            </div>
          ) : isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback>{user.name}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reviews" className="cursor-pointer">
                    <Star className="mr-2 h-4 w-4" />
                    <span>My Reviews</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
