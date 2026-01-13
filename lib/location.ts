// Re-export location components and utilities for easy imports
export { LocationSearchInput } from "@/components/location-search-input";
export { useLocationStore } from "@/store/location-store";
export type { LocationState } from "@/store/location-store";
export {
  reverseGeocode,
  forwardGeocode,
  searchPlaces,
  getCurrentPosition,
} from "@/lib/geocoding";
export type { GeocodingResult, PlaceResult } from "@/lib/geocoding";
