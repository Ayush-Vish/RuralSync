// Geocoding utilities using Next.js API proxy (calls /api/geocode/*)
// This avoids direct browser calls to Nominatim and handles rate limiting on the server

export interface GeocodingResult {
  city: string;
  state: string;
  country: string;
  displayName: string;
}

export interface PlaceResult {
  placeId: string;
  lat: number;
  lng: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
  type: string;
}

// Reverse geocode coordinates to get city name (uses /api/geocode/reverse)
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `/api/geocode/reverse?lat=${lat}&lng=${lng}`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Extract city name and convert to slug
    const cityName = data.city || "";

    return {
      city: cityName.toLowerCase().replace(/\s+/g, "-"),
      state: data.state || "",
      country: data.country || "",
      displayName: data.displayName || "",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// Forward geocode city name to coordinates (uses /api/geocode/search)
export async function forwardGeocode(
  cityName: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `/api/geocode/search?q=${encodeURIComponent(cityName)}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data && data.length > 0) {
      return {
        lat: data[0].lat,
        lng: data[0].lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}

// Search places with autocomplete (uses /api/geocode/search)
export async function searchPlaces(
  query: string,
  options: {
    limit?: number;
  } = {}
): Promise<PlaceResult[]> {
  const { limit = 5 } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/geocode/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Place search failed");
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.map((place: any) => ({
      placeId: place.placeId || "",
      lat: place.lat,
      lng: place.lng,
      displayName: place.displayName || "",
      city: place.city || "",
      state: place.state || "",
      country: place.country || "",
      type: place.type || "",
    }));
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
}

// Get user's current position with retry logic
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    // First try with high accuracy (GPS) - longer timeout
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        // If high accuracy fails, try with low accuracy (network-based)
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          console.log("High accuracy failed, trying low accuracy...");
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: false, // Use network/WiFi location
              timeout: 15000,
              maximumAge: 600000, // Cache for 10 minutes
            }
          );
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds for GPS
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

// Store detected city in localStorage
export function storeDetectedCity(city: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ruralsync_detected_city", city);
    localStorage.setItem("ruralsync_city_timestamp", Date.now().toString());
  }
}

// Store full location in localStorage
export function storeLocation(location: {
  lat: number;
  lng: number;
  city: string;
  displayName: string;
}): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ruralsync_location", JSON.stringify(location));
    localStorage.setItem("ruralsync_location_timestamp", Date.now().toString());
  }
}

// Get stored location from localStorage
export function getStoredLocation(): {
  lat: number;
  lng: number;
  city: string;
  displayName: string;
} | null {
  if (typeof window === "undefined") return null;

  const locationStr = localStorage.getItem("ruralsync_location");
  const timestamp = localStorage.getItem("ruralsync_location_timestamp");

  if (!locationStr || !timestamp) return null;

  // Check if location is older than 24 hours
  const age = Date.now() - parseInt(timestamp);
  if (age > 24 * 60 * 60 * 1000) {
    localStorage.removeItem("ruralsync_location");
    localStorage.removeItem("ruralsync_location_timestamp");
    return null;
  }

  try {
    return JSON.parse(locationStr);
  } catch {
    return null;
  }
}

// Get stored city from localStorage
export function getStoredCity(): string | null {
  if (typeof window === "undefined") return null;

  const city = localStorage.getItem("ruralsync_detected_city");
  const timestamp = localStorage.getItem("ruralsync_city_timestamp");

  if (!city || !timestamp) return null;

  // Check if city detection is older than 24 hours
  const age = Date.now() - parseInt(timestamp);
  if (age > 24 * 60 * 60 * 1000) {
    localStorage.removeItem("ruralsync_detected_city");
    localStorage.removeItem("ruralsync_city_timestamp");
    return null;
  }

  return city;
}

// Clear stored city
export function clearStoredCity(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ruralsync_detected_city");
    localStorage.removeItem("ruralsync_city_timestamp");
    localStorage.removeItem("ruralsync_location");
    localStorage.removeItem("ruralsync_location_timestamp");
  }
}

// Format city slug to display name
export function formatCityName(citySlug: string): string {
  return citySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Convert display name to URL-friendly slug
export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}
