"use client";

import { useState, useEffect, useCallback, useRef, Suspense, use } from "react";
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
  X,
  Navigation,
  Loader2,
  ChevronRight,
  Building2,
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
import { CITY_DISPLAY_NAMES, SERVICE_CATEGORIES, SERVICE_DISPLAY_NAMES } from "@/lib/seo-constants";
import { ServiceCard, categoryIcons } from "@/components/service-card";
import { forwardGeocode } from "@/lib/geocoding";

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "distance" | "duration";

interface SearchPageContentProps {
  city: string;
}

function SearchPageContent({ city }: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cityName = CITY_DISPLAY_NAMES[city.toLowerCase()] || formatCityName(city);

  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "relevance"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000,
  ]);
  const [minRating, setMinRating] = useState<number>(
    Number(searchParams.get("minRating")) || 0
  );
  const [radiusInKm, setRadiusInKm] = useState<number>(
    Number(searchParams.get("radius")) || 50
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Categories from backend
  const [categories, setCategories] = useState<string[]>([]);

  // Suggestions for autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search query for suggestions
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get city coordinates on mount
  useEffect(() => {
    const getCityCoords = async () => {
      const result = await forwardGeocode(cityName);
      if (result) {
        setCoords(result);
      }
    };
    getCityCoords();
  }, [cityName]);

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
        const response = await apiService.getSearchSuggestions(
          debouncedSearchQuery,
          8
        );
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
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
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
        locationText: city, // Always include city name
        limit: 50,
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
  }, [searchQuery, selectedCategory, coords, radiusInKm, priceRange, minRating, sortBy, city]);

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
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (radiusInKm !== 50) params.set("radius", radiusInKm.toString());

    router.push(`/${city}/search?${params.toString()}`);
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
    router.push(`/${city}/search`);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    minRating > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* City Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-2">
            <Link href={`/${city}`} className="hover:text-white transition-colors">
              {cityName}
            </Link>
            <span>/</span>
            <span className="text-white">Search</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Search Services in {cityName}
          </h1>
          <p className="text-green-100 mt-1">
            Find trusted professionals for all your needs
          </p>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white border-b sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input with Suggestions */}
              <div className="flex-1 relative" ref={suggestionsRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={`Search services in ${cityName}...`}
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

              {/* Category Select */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="lg:w-48 h-12 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryIcons[cat] || "📦"} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="lg:w-40 h-12 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                </SelectContent>
              </Select>

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
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "Searching..."
              ) : (
                <>
                  Found <span className="font-semibold text-foreground">{services.length}</span>{" "}
                  services in {cityName}
                  {searchQuery && (
                    <> for &quot;<span className="font-medium">{searchQuery}</span>&quot;</>
                  )}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
            <div className="hidden sm:flex border rounded-lg p-1 bg-slate-50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SERVICE_CATEGORIES.slice(0, 8).map((slug) => {
            const name = SERVICE_DISPLAY_NAMES[slug];
            const isActive = selectedCategory.toLowerCase() === name.toLowerCase();
            return (
              <Badge
                key={slug}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer py-1.5 px-3 ${
                  isActive
                    ? "bg-green-600 hover:bg-green-700"
                    : "hover:bg-green-50 hover:border-green-300"
                }`}
                onClick={() => setSelectedCategory(isActive ? "all" : name)}
              >
                {categoryIcons[name] || "📦"} {name}
              </Badge>
            );
          })}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-muted-foreground">Searching in {cityName}...</span>
          </div>
        ) : services.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}" in ${cityName}`
                  : `No services available in ${cityName} yet`}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Link href={`/${city}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Back to {cityName}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Back to City Link */}
        <div className="mt-12 text-center">
          <Link href={`/${city}`}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {cityName} Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatCityName(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Loading fallback
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

// Page component
export default function CitySearchPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = use(params);

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageContent city={city} />
    </Suspense>
  );
}
