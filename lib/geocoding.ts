// Reverse geocoding utility using OpenStreetMap Nominatim API

export interface GeocodingResult {
  city: string;
  state: string;
  country: string;
  displayName: string;
}

// Reverse geocode coordinates to get city name
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "RuralSync/1.0",
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
  cityName: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName
      )},India&limit=1`,
      {
        headers: {
          "User-Agent": "RuralSync/1.0",
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

// Get user's current position
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
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
  }
}
