"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { LocationSearchInput } from "@/components/location-search-input";
import { Button } from "@/components/ui/button";
import {
  getStoredCity,
  getStoredLocation,
  reverseGeocode,
  storeDetectedCity,
  storeLocation,
} from "@/lib/geocoding";
import { getCitySlug } from "@/lib/seo-constants";
import { useLocationStore } from "@/store/location-store";

const PROVIDER_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? "https://ruralsync-service-provider.vercel.app/login"
    : "http://localhost:5174/login";
const AGENT_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? "https://agent-rural-sync.vercel.app/login"
    : "http://localhost:5173/login";

type DetectionState = "detecting" | "selecting" | "redirecting";

interface SelectedLocation {
  lat: number;
  lng: number;
  city: string;
  displayName: string;
}

function getLocationErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = Number((error as { code: unknown }).code);

    if (code === 1) {
      return "Location permission was denied. Allow it in your browser and retry, or enter your location manually.";
    }
    if (code === 2) {
      return "Your location is unavailable. Check your device settings or enter your location manually.";
    }
    if (code === 3) {
      return "Location permission took too long. You can retry after allowing it or enter your location manually.";
    }
  }

  return "We could not detect your location. Retry or enter your location manually.";
}

export default function RootPage() {
  const router = useRouter();
  const setLocation = useLocationStore((state) => state.setLocation);
  const [detectionState, setDetectionState] = useState<DetectionState>("detecting");
  const [status, setStatus] = useState("Waiting for location permission...");
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const selectLocation = useCallback(
    (location: SelectedLocation) => {
      const cityName = location.city.trim() || location.displayName.split(",")[0]?.trim();
      if (!cityName) {
        setDetectionState("selecting");
        setError("Please select a location that includes a city name.");
        return;
      }

      // Ignore a late geolocation callback after the user chooses manually.
      requestIdRef.current += 1;
      const citySlug = getCitySlug(cityName);
      setDetectionState("redirecting");
      setStatus(`Opening services near ${cityName}...`);
      setError(null);
      setLocation({
        latitude: location.lat,
        longitude: location.lng,
        city: citySlug,
        displayName: location.displayName,
      });
      storeDetectedCity(citySlug);
      storeLocation({
        lat: location.lat,
        lng: location.lng,
        city: citySlug,
        displayName: location.displayName,
      });

      const query = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
      });
      router.push(`/${citySlug}?${query.toString()}`);
    },
    [router, setLocation]
  );

  const detectLocation = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setDetectionState("detecting");
    setStatus("Waiting for location permission...");
    setError(null);

    if (!navigator.geolocation) {
      setDetectionState("selecting");
      setStatus("Choose your location");
      setError("This browser does not support location detection. Enter your location manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (requestId !== requestIdRef.current) return;

        setDetectionState("redirecting");
        setStatus("Finding services near you...");

        const { latitude, longitude } = position.coords;
        const geocodeResult = await reverseGeocode(latitude, longitude);
        if (requestId !== requestIdRef.current) return;

        if (!geocodeResult?.city) {
          setDetectionState("selecting");
          setStatus("Choose your location");
          setError("Your coordinates were detected, but the city could not be identified. Enter it manually.");
          return;
        }

        selectLocation({
          lat: latitude,
          lng: longitude,
          city: geocodeResult.city,
          displayName: geocodeResult.displayName,
        });
      },
      (geolocationError) => {
        if (requestId !== requestIdRef.current) return;

        setDetectionState("selecting");
        setStatus("Choose your location");
        setError(getLocationErrorMessage(geolocationError));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      }
    );
  }, [selectLocation]);

  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      const query = new URLSearchParams({
        lat: storedLocation.lat.toString(),
        lng: storedLocation.lng.toString(),
      });
      router.push(`/${storedLocation.city}?${query.toString()}`);
      return;
    }

    const storedCity = getStoredCity();
    if (storedCity) {
      router.push(`/${storedCity}`);
      return;
    }

    detectLocation();

    return () => {
      requestIdRef.current += 1;
    };
  }, [detectLocation, router]);

  const isBusy = detectionState !== "selecting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-3xl px-4 py-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          {isBusy ? (
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
          ) : (
            <MapPin className="h-10 w-10 text-green-600" />
          )}
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          {status}
        </h1>
        <p className="text-center text-slate-600">
          {detectionState === "detecting"
            ? "Allow location access when your browser asks, or search manually below."
            : "Select a city or area to find nearby rural services."}
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </p>
          )}

          <LocationSearchInput
            placeholder="Enter your city or area"
            onLocationSelect={selectLocation}
            showGpsButton={false}
          />

          {detectionState === "selecting" && (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={detectLocation}
            >
              Retry location detection
            </Button>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Not booking as a customer?</p>
          <p className="mt-1 text-sm text-slate-500">
            Service providers and agents can sign in to their dedicated dashboards.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={PROVIDER_LOGIN_URL}>
              <Button variant="outline" className="w-full sm:w-auto">
                Provider Login
              </Button>
            </a>
            <a href={AGENT_LOGIN_URL}>
              <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
                Agent Login
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
