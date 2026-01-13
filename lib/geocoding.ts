// Geocoding utilities using OpenStreetMap Nominatim API (100% free, no API key required)
// User-Agent is required per Nominatim usage policy

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RuralSync-App/1.0 (https://ruralsync.vercel.app)";

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

// Reverse geocode coordinates to get city name
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    const address = data.address;

    // Try to get city from various fields
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state_district ||
      "";

    return {
      city: city.toLowerCase().replace(/\s+/g, "-"),
      state: address.state || "",
      country: address.country || "",
      displayName: data.display_name || "",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// Forward geocode city name to coordinates
export async function forwardGeocode(
  cityName: string,
  countryCode: string = "in" // Default to India
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
        cityName
      )}&countrycodes=${countryCode}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}

// Search places with autocomplete (for location picker)
export async function searchPlaces(
  query: string,
  options: {
    limit?: number;
    countryCode?: string;
  } = {}
): Promise<PlaceResult[]> {
  const { limit = 5, countryCode = "in" } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      format: "json",
      q: query.trim(),
      limit: limit.toString(),
      addressdetails: "1",
    });

    // Add country code filter if specified
    if (countryCode) {
      params.set("countrycodes", countryCode);
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Place search failed");
    }

    const data = await response.json();

    return data.map((place: any) => {
      const address = place.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.state_district ||
        "";

      return {
        placeId: place.place_id?.toString() || "",
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        displayName: place.display_name || "",
        city: city,
        state: address.state || "",
        country: address.country || "",
        type: place.type || "",
      };
    });
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
}

// Get user's current position
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // Cache for 5 minutes
    });
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
