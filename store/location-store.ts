"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocationState {
  // Current location data
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  displayName: string | null;
  
  // Loading states
  isDetecting: boolean;
  error: string | null;
  
  // Actions
  setLocation: (location: {
    latitude: number;
    longitude: number;
    city?: string;
    displayName?: string;
  }) => void;
  setCity: (city: string) => void;
  setDetecting: (isDetecting: boolean) => void;
  setError: (error: string | null) => void;
  clearLocation: () => void;
  
  // Computed
  hasLocation: () => boolean;
  getCoordinates: () => { lat: number; lng: number } | null;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Initial state
      latitude: null,
      longitude: null,
      city: null,
      displayName: null,
      isDetecting: false,
      error: null,
      
      // Actions
      setLocation: (location) => {
        set({
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city || null,
          displayName: location.displayName || null,
          error: null,
        });
      },
      
      setCity: (city) => {
        set({ city });
      },
      
      setDetecting: (isDetecting) => {
        set({ isDetecting });
      },
      
      setError: (error) => {
        set({ error, isDetecting: false });
      },
      
      clearLocation: () => {
        set({
          latitude: null,
          longitude: null,
          city: null,
          displayName: null,
          error: null,
        });
      },
      
      // Computed helpers
      hasLocation: () => {
        const state = get();
        return state.latitude !== null && state.longitude !== null;
      },
      
      getCoordinates: () => {
        const state = get();
        if (state.latitude !== null && state.longitude !== null) {
          return { lat: state.latitude, lng: state.longitude };
        }
        return null;
      },
    }),
    {
      name: "ruralsync-location",
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        city: state.city,
        displayName: state.displayName,
      }),
    }
  )
);
