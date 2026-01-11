"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  reverseGeocode,
  getStoredCity,
  storeDetectedCity,
} from "@/lib/geocoding";
import { TARGET_CITIES, CITY_DISPLAY_NAMES } from "@/lib/seo-constants";

const DEFAULT_CITY = "gwalior";

export default function RootPage() {
  const router = useRouter();
  const [isDetecting, setIsDetecting] = useState(true);
  const [showCitySelector, setShowCitySelector] = useState(false);

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
        setShowCitySelector(true);
        setIsDetecting(false);
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const geocodeResult = await reverseGeocode(latitude, longitude);

        if (geocodeResult && geocodeResult.city) {
          // Check if detected city is in our target cities
          const detectedCity = geocodeResult.city.toLowerCase();
          const matchedCity = TARGET_CITIES.find(
            (c) => c === detectedCity || detectedCity.includes(c)
          );

          const cityToUse = matchedCity || detectedCity || DEFAULT_CITY;
          storeDetectedCity(cityToUse);
          router.push(`/${cityToUse}`);
        } else {
          // Fallback to default
          storeDetectedCity(DEFAULT_CITY);
          router.push(`/${DEFAULT_CITY}`);
        }
      } catch (err) {
        console.error("Location detection failed:", err);
        setShowCitySelector(true);
        setIsDetecting(false);
      }
    };

    detectAndRedirect();
  }, [router]);

  const handleCitySelect = (city: string) => {
    storeDetectedCity(city);
    router.push(`/${city}`);
  };

  if (isDetecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Detecting your location...
          </h1>
          <p className="text-slate-600">
            Finding the best services near you
          </p>
        </div>
      </div>
    );
  }

  if (showCitySelector) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Select Your City
            </h1>
            <p className="text-slate-600">
              Choose your city to see local services
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TARGET_CITIES.map((city) => (
              <Button
                key={city}
                variant="outline"
                className="h-14 text-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                onClick={() => handleCitySelect(city)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {CITY_DISPLAY_NAMES[city]}
              </Button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-green-600"
              onClick={() => handleCitySelect(DEFAULT_CITY)}
            >
              Skip and continue to {CITY_DISPLAY_NAMES[DEFAULT_CITY]}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
