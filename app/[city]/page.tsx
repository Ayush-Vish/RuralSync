import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { ServiceCard, categoryIcons } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Search,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Users,
  ChevronRight,
  BadgeIndianRupee,
  Check,
  Eye,
  Scissors,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Service } from "@/types";
import {
  TARGET_CITIES,
  CITY_DISPLAY_NAMES,
  SERVICE_CATEGORIES,
  SERVICE_DISPLAY_NAMES,
} from "@/lib/seo-constants";

const PROVIDER_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? "https://ruralsync-service-provider.vercel.app/login"
    : "http://localhost:5174/login";
const PROVIDER_REGISTER_URL =
  process.env.NODE_ENV === "production"
    ? "https://ruralsync-service-provider.vercel.app/auth/register"
    : "http://localhost:5174/auth/register";

const providerPlans = [
  {
    planId: "STARTER",
    name: "Starter",
    price: "₹499/mo",
    description: "For solo providers getting listed and taking their first online bookings.",
    services: "Up to 3 services",
    agents: "1 agent account",
    visibility: "Standard local visibility",
    accent: "from-white/18 via-white/10 to-transparent",
    badge: "New providers",
    featured: false,
  },
  {
    planId: "GROWTH",
    name: "Growth",
    price: "₹1,499/mo",
    description: "For active businesses managing multiple services and a small field team.",
    services: "Up to 10 services",
    agents: "Up to 5 agents",
    visibility: "Priority placement in search",
    accent: "from-emerald-200/30 via-white/14 to-transparent",
    badge: "Most popular",
    featured: true,
  },
  {
    planId: "PRO",
    name: "Pro",
    price: "₹3,999/mo",
    description: "For established teams that want more reach, more staff, and stronger demand capture.",
    services: "Unlimited services",
    agents: "Up to 20 agents",
    visibility: "Featured visibility across local pages",
    accent: "from-amber-200/30 via-white/12 to-transparent",
    badge: "Scale faster",
    featured: false,
  },
] as const;

// API Base URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://ruralsyncapi.vercel.app"
    : "http://localhost:5000";

interface PageProps {
  params: Promise<{
    city: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const cityLower = city.toLowerCase();

  // Check if it's a valid city
  const cityName = CITY_DISPLAY_NAMES[cityLower] || formatCityName(city);

  const title = `Local Home Services in ${cityName} | RuralSync`;
  const description = `Find and book trusted local home services in ${cityName}. Browse plumbing, electrical, cleaning, gardening, and more. Compare prices, read reviews, and book online on RuralSync.`;

  return {
    title,
    description,
    keywords: [
      `services in ${cityName}`,
      `home services ${cityName}`,
      `local services ${cityName}`,
      `${cityName} plumbing`,
      `${cityName} electrical`,
      `${cityName} cleaning`,
      `trusted professionals ${cityName}`,
      "RuralSync",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      siteName: "RuralSync",
      url: `https://ruralsync.vercel.app/${city}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://ruralsync.vercel.app/${city}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for known cities
export async function generateStaticParams() {
  return TARGET_CITIES.map((city) => ({ city }));
}

// Format city name for display
function formatCityName(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Fetch top services from API
async function fetchTopServices(city: string): Promise<Service[]> {
  try {
    const params = new URLSearchParams({
      locationText: city,
      limit: "12",
      sortBy: "rating",
    });

    const response = await fetch(
      `${API_BASE}/api/client/search?${params.toString()}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.services || data.data || [];
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

// Fetch service providers/organizations
async function fetchProviders(city: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/client/services/providers?locationText=${encodeURIComponent(city)}&limit=6`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.providers || data.data || [];
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return [];
  }
}

// Generate JSON-LD for SEO
function generateJsonLd(city: string, services: Service[]): object {
  const cityName = CITY_DISPLAY_NAMES[city.toLowerCase()] || formatCityName(city);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Local Services in ${cityName}`,
      description: `Find trusted local home services in ${cityName}`,
      url: `https://ruralsync.vercel.app/${city}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: services.length,
        itemListElement: services.slice(0, 10).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            provider: {
              "@type": "Organization",
              name: s.organization?.name || "RuralSync Provider",
            },
            areaServed: {
              "@type": "City",
              name: cityName,
            },
            offers: {
              "@type": "Offer",
              price: s.basePrice,
              priceCurrency: "INR",
            },
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://ruralsync.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: cityName,
          item: `https://ruralsync.vercel.app/${city}`,
        },
      ],
    },
  ];
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const cityLower = city.toLowerCase();
  const cityName = CITY_DISPLAY_NAMES[cityLower] || formatCityName(city);

  // Fetch data
  const [services, providers] = await Promise.all([
    fetchTopServices(cityLower),
    fetchProviders(cityLower),
  ]);

  // Generate JSON-LD
  const jsonLd = generateJsonLd(cityLower, services);

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const cat = service.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center gap-2 text-sm text-green-100 mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white font-medium">{cityName}</span>
              </nav>

              {/* Location Badge */}
              <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {cityName}, India
              </Badge>

              {/* H1 - Optimized for Local SEO */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Local Services in {cityName}
              </h1>

              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Find trusted service providers near you. Plumbing, electrical,
                cleaning, and more - all verified professionals at your service.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <Link href={`/search?locationText=${cityLower}`}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 text-white">
                      <Search className="h-6 w-6" />
                      <span className="text-lg">
                        Search for services in {cityName}...
                      </span>
                      <ArrowRight className="h-5 w-5 ml-auto" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-8 mt-10 text-green-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {services.length}+
                  </div>
                  <div className="text-sm">Services</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {providers.length}+
                  </div>
                  <div className="text-sm">Providers</div>
                </div>
                <div className="w-px h-12 bg-green-400/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.5</div>
                  <div className="text-sm">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
              Browse Services by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {SERVICE_CATEGORIES.map((serviceSlug) => {
                const serviceName = SERVICE_DISPLAY_NAMES[serviceSlug];
                const icon = categoryIcons[serviceName] || "📦";
                return (
                  <Link
                    key={serviceSlug}
                    href={`/${cityLower}/${serviceSlug}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2.5 text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 cursor-pointer transition-all"
                    >
                      <span className="mr-2">{icon}</span>
                      {serviceName}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Provider Plans Section */}
        <section className="relative overflow-hidden border-b border-green-200/80 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white shadow-[0_30px_80px_-32px_rgba(5,150,105,0.7)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />

          <div className="relative container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-6 lg:px-8 lg:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-1 text-xs font-medium tracking-[0.18em] text-white/90">
                <Sparkles className="h-3.5 w-3.5" />
                Grow On RuralSync
              </div>
              <h2 className="mt-5 max-w-2xl text-2xl font-bold leading-tight md:text-3xl lg:text-[2.15rem]">
                Become a service provider in {cityName}, add any service, and earn more from local demand.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                Join RuralSync to list everyday and skilled services like barber shops, electrical work,
                laptop repair, AC service, plumbing, pest control, appliance support, and more.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Barber Shop</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Electrical</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Laptop Repair</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">AC Service</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Pest Control</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={PROVIDER_REGISTER_URL}>
                  <Button className="h-11 w-full bg-white px-6 text-green-700 shadow-lg shadow-emerald-950/20 hover:bg-green-50 sm:w-auto">
                    Become a Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href={PROVIDER_LOGIN_URL}>
                  <Button
                    variant="outline"
                    className="h-11 w-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Provider Login
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2.5 shadow-inner shadow-white/10">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Any local service</p>
                    <p className="text-sm text-white/75">Start with home services, shop services, or technical work.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2.5 shadow-inner shadow-white/10">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Manage services and agents</p>
                    <p className="text-sm text-white/75">Control bookings, assignments, and day-to-day operations from one dashboard.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2.5 shadow-inner shadow-white/10">
                    <BadgeIndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Earn from bookings</p>
                    <p className="text-sm text-white/75">Get discovered by local customers and grow recurring revenue.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-2.5 shadow-inner shadow-white/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Built for scale</p>
                    <p className="text-sm text-white/75">Upgrade your plan as you add more services, staff, and visibility needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/12 bg-slate-950/10 px-6 py-6 md:px-8 md:py-8 lg:px-10">
            <div className="container mx-auto">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
                    Choose Your Plan
                  </p>
                  <h3 className="mt-2 text-2xl font-bold md:text-[2rem]">
                    Pick the plan that matches your services, team size, and visibility goals.
                  </h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-white/75">
                  Start small, add more services, onboard agents, and upgrade when you want stronger discovery.
                </p>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-3">
                {providerPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.85)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 ${
                      plan.featured
                        ? "border-emerald-100/40 bg-gradient-to-br from-white/20 via-emerald-100/10 to-white/8 ring-1 ring-white/20"
                        : "border-white/12 bg-gradient-to-br from-white/12 via-white/8 to-transparent"
                    }`}
                  >
                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${plan.accent} opacity-90`} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative z-10">
                        <p className="text-lg font-semibold">{plan.name}</p>
                        <p className="mt-1 text-sm leading-6 text-white/75">{plan.description}</p>
                      </div>
                      <span className="relative z-10 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                        {plan.badge}
                      </span>
                    </div>

                    <div className="relative z-10 mt-6 rounded-2xl border border-white/12 bg-slate-950/16 px-4 py-4">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="pb-1 text-sm text-white/70">billed monthly</span>
                      </div>
                    </div>

                    <div className="relative z-10 mt-5 space-y-3 text-sm">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                        <Wrench className="h-4 w-4 text-white/90" />
                        <span>{plan.services}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                        <Users className="h-4 w-4 text-white/90" />
                        <span>{plan.agents}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                        <Eye className="h-4 w-4 text-white/90" />
                        <span>{plan.visibility}</span>
                      </div>
                    </div>

                    <div className="relative z-10 mt-5 flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-emerald-200" />
                      <span>Bookings, notifications, and provider dashboard included.</span>
                    </div>

                    <a
                      href={`${PROVIDER_REGISTER_URL}?plan=${plan.planId}`}
                      className="relative z-10 mt-5 block"
                    >
                      <Button
                        className={`w-full ${
                          plan.featured
                            ? "bg-white text-emerald-700 hover:bg-emerald-50"
                            : "bg-white/10 text-white hover:bg-white/15"
                        }`}
                      >
                        Choose {plan.name}
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Top Services */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Top Services in {cityName}
                </h2>
                <p className="text-muted-foreground mt-2">
                  Highest-rated services by local customers
                </p>
              </div>
              <Link href={`/search?locationText=${cityLower}&sortBy=rating`}>
                <Button variant="outline" className="hidden sm:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.slice(0, 6).map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CardContent>
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Services Found in {cityName}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;re expanding to {cityName} soon! Check back later or
                    browse services in other cities.
                  </p>
                  <Link href="/search">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Browse All Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {services.length > 6 && (
              <div className="text-center mt-8">
                <Link href={`/search?locationText=${cityLower}`}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    View All {services.length}+ Services
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Services by Category */}
          {Object.keys(servicesByCategory).length > 1 && (
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                Services by Category
              </h2>

              <div className="space-y-12">
                {Object.entries(servicesByCategory)
                  .slice(0, 3)
                  .map(([category, categoryServices]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                          <span className="text-2xl">
                            {categoryIcons[category] || "📦"}
                          </span>
                          {category}
                        </h3>
                        <Link
                          href={`/search?locationText=${cityLower}&category=${encodeURIComponent(category)}`}
                        >
                          <Button variant="ghost" size="sm">
                            View All
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {categoryServices.slice(0, 3).map((service) => (
                          <ServiceCard key={service._id} service={service} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Why RuralSync Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Why Book on RuralSync in {cityName}?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Providers",
                  desc: "All professionals are background-checked",
                },
                {
                  icon: Star,
                  title: "Genuine Reviews",
                  desc: "Real ratings from local customers",
                },
                {
                  icon: Clock,
                  title: "Easy Booking",
                  desc: "Book services in under 2 minutes",
                },
                {
                  icon: Users,
                  title: "Local Experts",
                  desc: `Trusted professionals from ${cityName}`,
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Other Cities */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Explore Other Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {TARGET_CITIES.filter((c) => c !== cityLower).map((otherCity) => (
                <Link key={otherCity} href={`/${otherCity}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2.5 text-sm hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                  >
                    <MapPin className="h-3 w-3 mr-2" />
                    {CITY_DISPLAY_NAMES[otherCity]}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* CTA Footer */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need a Service in {cityName}?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Search from {services.length}+ services and find the perfect match
              for your needs.
            </p>
            <Link href={`/search?locationText=${cityLower}`}>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 font-semibold px-8 py-6 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Services in {cityName}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
