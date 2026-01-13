"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  SlidersHorizontal,
  X,
  Navigation,
  Loader2,
  ChevronRight,
  Building2,
  IndianRupee,
  Map,
  List,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { apiService } from "@/lib/api-service";
import type { Service } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocationStore } from "@/store/location-store";
import { LocationSearchInput } from "@/components/location-search-input";

// Category icons mapping
const categoryIcons: Record<string, string> = {
  "Farm Equipment": "🚜",
  "Harvesting": "🌾",
  "Livestock": "🐄",
  "Repair": "🔧",
  "Transport": "🚛",
  "Irrigation": "💧",
  "Pest Control": "🐛",
  "Consulting": "📊",
};

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance' | 'duration';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Global location store
  const { 
    latitude: globalLat, 
    longitude: globalLng, 
    displayName: globalDisplayName,
    city: globalCity,
    setLocation: setGlobalLocation,
    clearLocation 
  } = useLocationStore();

  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000
  ]);
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get("minRating")) || 0);
  const [radiusInKm, setRadiusInKm] = useState<number>(Number(searchParams.get("radius")) || 50);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isLocating, setIsLocating] = useState(false);
  
  // Initialize coords from URL params, then global store, or null
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(() => {
    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");
    if (urlLat && urlLng) {
      return { lat: Number(urlLat), lng: Number(urlLng) };
    }
    return null;
  });
  
  // Sync with global location store on mount
  useEffect(() => {
    if (!coords && globalLat && globalLng) {
      setCoords({ lat: globalLat, lng: globalLng });
      setLocation(globalDisplayName || globalCity || "Current Location");
    }
  }, []);
  
  // Categories from backend
  const [categories, setCategories] = useState<string[]>([]);
  
  // Suggestions for autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounced search query for suggestions
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getSearchCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await apiService.getSearchSuggestions(debouncedSearchQuery, 8);
        if (response.success) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };
    fetchSuggestions();
  }, [debouncedSearchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.searchServices({
        q: searchQuery,
        category: selectedCategory,
        lat: coords?.lat,
        lng: coords?.lng,
        radiusInKm: coords ? radiusInKm : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy: sortBy,
        limit: 50
      });

      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, coords, radiusInKm, priceRange, minRating, sortBy]);

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocation("Current Location (GPS)");
        
        // Update global store
        setGlobalLocation({
          latitude,
          longitude,
          displayName: "Current Location (GPS)",
        });
        
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Clear location
  const handleClearLocation = () => {
    setCoords(null);
    setLocation("");
    clearLocation();
  };
  
  // Handle location selection from search input
  const handleLocationSelect = (selectedLocation: {
    lat: number;
    lng: number;
    city: string;
    displayName: string;
  }) => {
    setCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    setLocation(selectedLocation.displayName);
    
    // Update global store
    setGlobalLocation({
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      city: selectedLocation.city,
      displayName: selectedLocation.displayName,
    });
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (coords) {
      params.set("lat", coords.lat.toString());
      params.set("lng", coords.lng.toString());
    }
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (radiusInKm !== 50) params.set("radius", radiusInKm.toString());
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSortBy("relevance");
    setRadiusInKm(50);
    handleClearLocation();
    router.push("/search");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory !== "all" || 
    priceRange[0] > 0 || priceRange[1] < 10000 || minRating > 0 || coords;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Search Header */}
      <div className="bg-white border-b sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input with Suggestions */}
              <div className="flex-1 relative" ref={suggestionsRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for services (e.g., tractor rental, harvesting...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 h-12 text-base bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm"
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="lg:w-96">
                <LocationSearchInput
                  value={location}
                  placeholder="Search location or use GPS"
                  onLocationSelect={handleLocationSelect}
                  onClear={handleClearLocation}
                  showGpsButton={true}
                  compact={true}
                />
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-green-600 hover:bg-green-700 text-base font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
            
            {/* Quick info about location search */}
            {coords && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Searching within {radiusInKm}km of your location
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border shadow-sm p-5 sticky top-[180px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-green-600 h-8"
                    onClick={handleClearFilters}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === "all"
                        ? "bg-green-50 text-green-700 font-medium"
                        : "hover:bg-slate-50"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategory === category
                          ? "bg-green-50 text-green-700 font-medium"
                          : "hover:bg-slate-50"
                        }`}
                    >
                      <span>{categoryIcons[category] || "📦"}</span>
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Min</label>
                    <Input
                      type="number"
                      placeholder="₹0"
                      value={priceRange[0] || ""}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max</label>
                    <Input
                      type="number"
                      placeholder="₹10000"
                      value={priceRange[1] || ""}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sort By */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Sort By
                </h4>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="distance">Nearest First</SelectItem>
                    <SelectItem value="duration">Shortest Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Radius (only when location is active) */}
              {coords && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Search Radius
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Distance</span>
                        <span className="font-medium">{radiusInKm} km</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={radiusInKm}
                        onChange={(e) => setRadiusInKm(Number(e.target.value))}
                        className="w-full accent-green-600"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5km</span>
                        <span>200km</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Rating Filter */}
              <Separator className="my-4" />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Minimum Rating
                </h4>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                        minRating === rating
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {rating === 0 ? "All" : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Services"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {services.length} services found
                  {location && ` near ${location}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                {/* View Toggle */}
                <div className="flex items-center border rounded-lg p-1 bg-slate-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-slate-100"
                      }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="1" y="1" width="6" height="6" rx="1" />
                      <rect x="9" y="1" width="6" height="6" rx="1" />
                      <rect x="1" y="9" width="6" height="6" rx="1" />
                      <rect x="9" y="9" width="6" height="6" rx="1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-slate-100"
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {coords && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    <MapPin className="h-3 w-3" />
                    Within {radiusInKm}km
                    <button onClick={handleClearLocation}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {priceRange[0] > 0 && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    Min: ₹{priceRange[0]}
                    <button onClick={() => setPriceRange([0, priceRange[1]])}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {priceRange[1] < 10000 && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    Max: ₹{priceRange[1]}
                    <button onClick={() => setPriceRange([priceRange[0], 10000])}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    <Star className="h-3 w-3" />
                    {minRating}+ stars
                    <button onClick={() => setMinRating(0)}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {sortBy !== "relevance" && (
                  <Badge variant="secondary" className="gap-1 pl-3">
                    Sort: {sortBy.replace("-", " ")}
                    <button onClick={() => setSortBy("relevance")}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="animate-pulse">
                      <div className="h-40 bg-slate-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : services.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No services found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            ) : (
              /* Services Grid/List */
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              >
                {services.map((service: Service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({
  service,
  viewMode,
}: {
  service: Service;
  viewMode: "list" | "grid";
}) {
  // Get rating from service or default
  const rating = service.rating || 0;
  
  if (viewMode === "list") {
    return (
      <Link href={`/services/${service._id}`}>
        <Card className="overflow-hidden hover:shadow-md transition-all hover:border-green-200 group">
          <div className="flex">
            {/* Image */}
            <div className="w-48 h-36 flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative overflow-hidden">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-5xl">
                  {categoryIcons[service.category] || "📦"}
                </span>
              )}
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                    {service.distanceInKm !== undefined && service.distanceInKm !== null && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        <Navigation className="h-3 w-3 mr-1" />
                        {service.distanceInKm} km
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {service.organization?.name || "Provider"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{service.basePrice}
                  </div>
                  <span className="text-xs text-muted-foreground">starting</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.estimatedDuration || "N/A"} hrs
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {service.address || "Multiple locations"}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/services/${service._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-green-200 group h-full">
        {/* Image Header */}
        <div className="h-40 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0]}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl">{categoryIcons[service.category] || "📦"}</span>
          )}
          <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-white">
            {service.category}
          </Badge>
          {service.distanceInKm !== undefined && service.distanceInKm !== null && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white">
              <Navigation className="h-3 w-3 mr-1" />
              {service.distanceInKm} km
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Provider & Rating */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {service.organization?.name || "Provider"}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {service.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.estimatedDuration || "N/A"} hrs
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {service.address || "Available nearby"}
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <span className="text-2xl font-bold text-green-600">
                ₹{service.basePrice}
              </span>
              <span className="text-xs text-muted-foreground ml-1">starting</span>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 gap-1 group-hover:gap-2 transition-all"
            >
              View
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading fallback for Suspense
function SearchLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-muted-foreground">Loading search...</span>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
