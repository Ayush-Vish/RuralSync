"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  reverseGeocode,
  getStoredCity,
  storeDetectedCity,
} from "@/lib/geocoding";
import { TARGET_CITIES } from "@/lib/seo-constants";
import { useLocationStore } from "@/store/location-store";

const DEFAULT_CITY = "gwalior";

export default function RootPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Detecting your location...");
  const { setLocation } = useLocationStore();

  useEffect(() => {
    const detectAndRedirect = async () => {
      // Check if we have a stored city
      const storedCity = getStoredCity();
      if (storedCity) {
        router.push(`/${storedCity}`);
        return;
      }

      // Try to detect location
      if (!navigator.geolocation) {
        setStatus("Using default location...");
        storeDetectedCity(DEFAULT_CITY);
        router.push(`/${DEFAULT_CITY}`);
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 300000,
            });
          }
        );

        const { latitude, longitude } = position.coords;
        setStatus("Finding services near you...");
        
        const geocodeResult = await reverseGeocode(latitude, longitude);
        console.log( "getcpde => " ,   geocodeResult)
        if (geocodeResult && geocodeResult.city) {
          // Check if detected city is in our target cities
          const detectedCity = geocodeResult.city.toLowerCase();
          const matchedCity = TARGET_CITIES.find(
            (c) => c === detectedCity || detectedCity.includes(c)
          );

          const cityToUse = matchedCity || DEFAULT_CITY;
          
          // Update global location store
          setLocation({
            latitude,
            longitude,
            city: geocodeResult.city,
            displayName: geocodeResult.displayName,
          });
          
          storeDetectedCity(cityToUse);
          router.push(`/${cityToUse}`);
        } else {
          // Fallback to default
          storeDetectedCity(DEFAULT_CITY);
          router.push(`/${DEFAULT_CITY}`);
        }
      } catch (err) {
        console.error("Location detection failed:", err);
        // On error, just redirect to default city - don't show selector
        setStatus("Using default location...");
        storeDetectedCity(DEFAULT_CITY);
        router.push(`/${DEFAULT_CITY}`);
      }
    };

    detectAndRedirect();
  }, [router, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {status}
        </h1>
        <p className="text-slate-600">
          Finding the best services near you
        </p>
      </div>
    </div>
  );
}
