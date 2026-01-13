"use client"

import { useState, useEffect, useCallback } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { User, Settings, LogOut, Calendar, Star, Search, Menu, X, ChevronRight, MapPin, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/store"
import { usePathname, useRouter } from "next/navigation"
import { getStoredCity, storeDetectedCity } from "@/lib/geocoding"
import { TARGET_CITIES, CITY_DISPLAY_NAMES, getCitySlug } from "@/lib/seo-constants"
import { LocationSearchInput } from "@/components/location-search-input"
import { useLocationStore } from "@/store/location-store"

export function Header() {
  const { user, isLoggedIn, isLoading, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const { displayName: storedLocation, city: storedCity, setLocation } = useLocationStore()

  // Extract city from URL path or use global location store
  useEffect(() => {
    const pathParts = pathname.split("/").filter(Boolean)
    if (pathParts.length > 0 && TARGET_CITIES.includes(pathParts[0].toLowerCase())) {
      setCurrentCity(pathParts[0].toLowerCase())
    } else if (storedCity) {
      const slug = getCitySlug(storedCity)
      setCurrentCity(TARGET_CITIES.includes(slug) ? slug : null)
    } else {
      // Check localStorage
      const storedCityFromStorage = getStoredCity()
      setCurrentCity(storedCityFromStorage)
    }
  }, [pathname, storedCity])

  const handleCityChange = (city: string) => {
    storeDetectedCity(city)
    setCurrentCity(city)
    // Redirect to the city page
    window.location.href = `/${city}`
  }

  const handleLocationSelect = useCallback((location: {
    lat: number;
    lng: number;
    city: string;
    displayName: string;
  }) => {
    // Update global location store
    setLocation({
      latitude: location.lat,
      longitude: location.lng,
      city: location.city,
      displayName: location.displayName,
    })
    
    // Get city slug and redirect
    const citySlug = getCitySlug(location.city)
    storeDetectedCity(citySlug)
    setCurrentCity(TARGET_CITIES.includes(citySlug) ? citySlug : null)
    setLocationPopoverOpen(false)
    
    // Navigate to search with coordinates
    if (TARGET_CITIES.includes(citySlug)) {
      router.push(`/${citySlug}/search`)
    } else {
      router.push(`/search?lat=${location.lat}&lng=${location.lng}&city=${encodeURIComponent(location.city)}`)
    }
  }, [setLocation, router])

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/30 transition-shadow">
              <span className="text-white font-bold">RS</span>
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:block">RuralSync</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Location Selector with Search */}
            <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="px-3 py-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium flex items-center gap-1"
                >
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="max-w-[120px] truncate">
                    {storedLocation || (currentCity ? CITY_DISPLAY_NAMES[currentCity] : "Select Location")}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Your Location</h4>
                    <p className="text-sm text-muted-foreground">Search for any location or use GPS</p>
                  </div>
                  <LocationSearchInput
                    value={storedLocation || ""}
                    placeholder="Search any location..."
                    onLocationSelect={handleLocationSelect}
                    onClear={() => {
                      setCurrentCity(null)
                    }}
                    showGpsButton={true}
                    compact={true}
                  />
                  {/* Popular Cities */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Popular Cities</p>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_CITIES.slice(0, 6).map((city) => (
                        <Button
                          key={city}
                          variant={currentCity === city ? "default" : "outline"}
                          size="sm"
                          className={currentCity === city ? "bg-green-600 hover:bg-green-700" : ""}
                          onClick={() => handleCityChange(city)}
                        >
                          {CITY_DISPLAY_NAMES[city]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Link 
              href={currentCity ? `/${currentCity}/search` : "/search"}
              className="px-4 py-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link 
              href="/services" 
              className="px-4 py-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium"
            >
              Services
            </Link>
            <Link 
              href="/providers" 
              className="px-4 py-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium"
            >
              Providers
            </Link>
            {isLoggedIn && (
              <Link 
                href="/bookings" 
                className="px-4 py-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium"
              >
                My Bookings
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 animate-pulse bg-slate-200 rounded-full"></div>
              </div>
            ) : isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-green-100 hover:ring-green-200 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-medium">
                        {getInitials(user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4 bg-slate-50 -m-1 mb-1 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                          {getInitials(user.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-1">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reviews" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span>My Reviews</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-3 p-2.5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Settings className="h-4 w-4 text-slate-600" />
                        </div>
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-1">
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer flex items-center gap-3 p-2.5 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-green-600 hover:bg-green-700 font-medium shadow-lg shadow-green-600/20">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link 
              href="/search" 
              className="flex items-center justify-between px-4 py-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                Search Services
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/services" 
              className="flex items-center justify-between px-4 py-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>All Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/providers" 
              className="flex items-center justify-between px-4 py-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Providers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            {isLoggedIn && (
              <Link 
                href="/bookings" 
                className="flex items-center justify-between px-4 py-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>My Bookings</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            {!isLoggedIn && (
              <div className="pt-4 px-4 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
