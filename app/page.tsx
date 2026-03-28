"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeIndianRupee,
  Check,
  Eye,
  Loader2,
  Scissors,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  reverseGeocode,
  getStoredCity,
  storeDetectedCity,
} from "@/lib/geocoding";
import { TARGET_CITIES } from "@/lib/seo-constants";
import { useLocationStore } from "@/store/location-store";

const DEFAULT_CITY = "gwalior";
const PROVIDER_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? "https://ruralsync-service-provider.vercel.app/login"
    : "http://localhost:5174/login";
const AGENT_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? "https://agent-rural-sync.vercel.app/login"
    : "http://localhost:5173/login";
const PROVIDER_REGISTER_URL =
  process.env.NODE_ENV === "production"
    ? "https://ruralsync-service-provider.vercel.app/auth/register"
    : "http://localhost:5174/auth/register";

const providerPlans = [
  {
    name: "Starter",
    description: "For solo providers getting listed and taking their first online bookings.",
    services: "Up to 3 services",
    agents: "1 agent account",
    visibility: "Standard local visibility",
    accent: "from-white/16 to-white/8",
    badge: "New providers",
  },
  {
    name: "Growth",
    description: "For active businesses managing multiple services and a small field team.",
    services: "Up to 10 services",
    agents: "Up to 5 agents",
    visibility: "Priority placement in search",
    accent: "from-emerald-300/25 to-white/10",
    badge: "Most popular",
  },
  {
    name: "Pro",
    description: "For established teams that want more reach, more staff, and stronger demand capture.",
    services: "Unlimited services",
    agents: "Up to 20 agents",
    visibility: "Featured visibility across local pages",
    accent: "from-amber-300/25 to-white/10",
    badge: "Scale faster",
  },
] as const;

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
      <div className="w-full max-w-3xl px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {status}
        </h1>
        <p className="text-slate-600 text-center">
          Finding the best services near you
        </p>
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

        <div className="mt-6 overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white shadow-xl">
          <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.9fr] md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                Grow On RuralSync
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
                Become a provider, list your services, and earn more from local demand.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                Join as a service provider and start taking bookings for everyday businesses and skilled work:
                barber shops, electrical services, laptop repair, AC servicing, pest control, plumbing, appliance
                support, and more.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white/15 px-3 py-1">Barber Shop</span>
                <span className="rounded-full bg-white/15 px-3 py-1">Electrical</span>
                <span className="rounded-full bg-white/15 px-3 py-1">Laptop Repair</span>
                <span className="rounded-full bg-white/15 px-3 py-1">AC Service</span>
                <span className="rounded-full bg-white/15 px-3 py-1">Pest Control</span>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={PROVIDER_REGISTER_URL}>
                  <Button className="w-full bg-white text-green-700 hover:bg-green-50 sm:w-auto">
                    Become a Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href={PROVIDER_LOGIN_URL}>
                  <Button variant="outline" className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
                    Provider Login
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Simple local services</p>
                    <p className="text-sm text-white/75">Shops and neighborhood businesses can start quickly.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Skilled technical work</p>
                    <p className="text-sm text-white/75">List repair, installation, maintenance, and field services.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2">
                    <BadgeIndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Earn from bookings</p>
                    <p className="text-sm text-white/75">Get discovered, receive bookings, assign agents, and grow revenue.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Dedicated provider dashboard</p>
                    <p className="text-sm text-white/75">Manage services, bookings, agents, notifications, and audit logs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/15 bg-slate-950/10 px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  Choose Your Plan
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  Pick the setup that matches your services, team size, and visibility goals.
                </h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/75">
                Start small, add more services, onboard agents, and upgrade when you want stronger discovery.
              </p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {providerPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl border border-white/15 bg-gradient-to-br ${plan.accent} p-5 shadow-lg backdrop-blur-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{plan.name}</p>
                      <p className="mt-1 text-sm leading-6 text-white/75">{plan.description}</p>
                    </div>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-3">
                      <Wrench className="h-4 w-4 text-white/90" />
                      <span>{plan.services}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-3">
                      <Users className="h-4 w-4 text-white/90" />
                      <span>{plan.agents}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-3">
                      <Eye className="h-4 w-4 text-white/90" />
                      <span>{plan.visibility}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-emerald-200" />
                    <span>Bookings, notifications, and provider dashboard included.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
