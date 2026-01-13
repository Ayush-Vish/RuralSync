"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocationStore } from "@/store/location-store";
import { reverseGeocode, getCurrentPosition } from "@/lib/geocoding";

export interface UseLocationReturn {
  // Location data
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  displayName: string | null;
  
  // Status
  isDetecting: boolean;
  hasLocation: boolean;
  error: string | null;
  
  // Actions
  detectLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number, city?: string, displayName?: string) => Promise<void>;
  clearLocation: () => void;
  
  // Helpers
  getCoordinates: () => { lat: number; lng: number } | null;
}

export function useLocation(): UseLocationReturn {
  const store = useLocationStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Detect user's current location using browser geolocation
  const detectLocation = useCallback(async () => {
    store.setDetecting(true);
    store.setError(null);
    
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get city name
      const geocodeResult = await reverseGeocode(latitude, longitude);
      
      store.setLocation({
        latitude,
        longitude,
        city: geocodeResult?.city || undefined,
        displayName: geocodeResult?.displayName || undefined,
      });
      
      store.setDetecting(false);
    } catch (error) {
      console.error("Location detection failed:", error);
      store.setError(
        error instanceof Error 
          ? error.message 
          : "Failed to detect location. Please enable location services."
      );
      store.setDetecting(false);
    }
  }, [store]);
  
  // Set location manually (from search or map click)
  const setManualLocation = useCallback(async (
    lat: number,
    lng: number,
    city?: string,
    displayName?: string
  ) => {
    // If city or displayName not provided, reverse geocode
    if (!city || !displayName) {
      const geocodeResult = await reverseGeocode(lat, lng);
      store.setLocation({
        latitude: lat,
        longitude: lng,
        city: city || geocodeResult?.city || undefined,
        displayName: displayName || geocodeResult?.displayName || undefined,
      });
    } else {
      store.setLocation({
        latitude: lat,
        longitude: lng,
        city,
        displayName,
      });
    }
  }, [store]);
  
  // Clear stored location
  const clearLocation = useCallback(() => {
    store.clearLocation();
  }, [store]);
  
  // Get coordinates helper
  const getCoordinates = useCallback(() => {
    return store.getCoordinates();
  }, [store]);
  
  return {
    // Location data (only return from store if client-side)
    latitude: isClient ? store.latitude : null,
    longitude: isClient ? store.longitude : null,
    city: isClient ? store.city : null,
    displayName: isClient ? store.displayName : null,
    
    // Status
    isDetecting: store.isDetecting,
    hasLocation: isClient ? store.hasLocation() : false,
    error: store.error,
    
    // Actions
    detectLocation,
    setManualLocation,
    clearLocation,
    
    // Helpers
    getCoordinates,
  };
}
