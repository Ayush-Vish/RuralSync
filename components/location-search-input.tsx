"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Loader2,
  X,
  Clock,
  Search,
} from "lucide-react";
import { searchPlaces, PlaceResult, getCurrentPosition, reverseGeocode } from "@/lib/geocoding";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface LocationSearchInputProps {
  value?: string;
  placeholder?: string;
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    city: string;
    displayName: string;
  }) => void;
  onClear?: () => void;
  className?: string;
  showGpsButton?: boolean;
  compact?: boolean;
}

// Recent locations stored in localStorage
const RECENT_LOCATIONS_KEY = "ruralsync_recent_locations";
const MAX_RECENT_LOCATIONS = 5;

function getRecentLocations(): PlaceResult[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentLocation(location: PlaceResult): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentLocations().filter(
      (l) => l.placeId !== location.placeId
    );
    recent.unshift(location);
    localStorage.setItem(
      RECENT_LOCATIONS_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_LOCATIONS))
    );
  } catch {
    // Ignore storage errors
  }
}

export function LocationSearchInput({
  value = "",
  placeholder = "Search location...",
  onLocationSelect,
  onClear,
  className,
  showGpsButton = true,
  compact = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [recentLocations, setRecentLocations] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent locations on mount
  useEffect(() => {
    setRecentLocations(getRecentLocations());
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Search places when query changes
  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const places = await searchPlaces(debouncedQuery, {
          limit: 6,
        });
        setResults(places);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle location selection
  const handleSelect = useCallback((place: PlaceResult) => {
    setQuery(place.displayName);
    setIsOpen(false);
    saveRecentLocation(place);
    onLocationSelect({
      lat: place.lat,
      lng: place.lng,
      city: place.city,
      displayName: place.displayName,
    });
  }, [onLocationSelect]);

  // Handle GPS location detection
  const handleDetectLocation = useCallback(async () => {
    setIsDetectingGps(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const geocodeResult = await reverseGeocode(latitude, longitude);
      
      if (geocodeResult) {
        const place: PlaceResult = {
          placeId: `gps-${Date.now()}`,
          lat: latitude,
          lng: longitude,
          displayName: geocodeResult.displayName,
          city: geocodeResult.city,
          state: geocodeResult.state,
          country: geocodeResult.country,
          type: "gps",
        };
        
        setQuery(geocodeResult.displayName);
        saveRecentLocation(place);
        onLocationSelect({
          lat: latitude,
          lng: longitude,
          city: geocodeResult.city,
          displayName: geocodeResult.displayName,
        });
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error("GPS detection failed:", error);
      
      // Show specific error messages based on error type
      let errorMessage = "Unable to detect your location.";
      
      if (error?.code === 1) {
        errorMessage = "Location permission denied. Please allow location access in your browser settings.";
      } else if (error?.code === 2) {
        errorMessage = "Location unavailable. Please check your device's GPS/location settings.";
      } else if (error?.code === 3) {
        errorMessage = "Location request timed out. Please try again or search manually.";
      } else if (error?.message === "Geolocation not supported") {
        errorMessage = "Your browser doesn't support location detection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsDetectingGps(false);
    }
  }, [onLocationSelect]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : recentLocations;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelect(items[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    setResults([]);
    onClear?.();
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (results.length > 0 || recentLocations.length > 0 || isLoading);

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-10 pr-10",
              compact ? "h-10" : "h-12"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {showGpsButton && (
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={handleDetectLocation}
            disabled={isDetectingGps}
            className={cn(compact ? "h-10 px-3" : "h-12")}
          >
            {isDetectingGps ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {!compact && <span className="ml-2 hidden sm:inline">GPS</span>}
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-auto"
        >
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-slate-50">
                Search Results
              </div>
              {results.map((place, index) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => handleSelect(place)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 border-b last:border-b-0",
                    selectedIndex === index && "bg-slate-50"
                  )}
                >
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {place.city || place.displayName.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {place.displayName}
                    </p>
                  </div>
                  {place.state && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {place.state}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Locations */}
          {results.length === 0 && recentLocations.length > 0 && !isLoading && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-slate-50 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent Locations
              </div>
              {recentLocations.map((place, index) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => handleSelect(place)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 border-b last:border-b-0",
                    selectedIndex === index && "bg-slate-50"
                  )}
                >
                  {place.type === "gps" ? (
                    <Navigation className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {place.city || place.displayName.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {place.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {results.length === 0 && recentLocations.length === 0 && !isLoading && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p>No locations found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
