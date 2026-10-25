// Target cities for SEO landing pages
export const TARGET_CITIES = [
  "gwalior",
  "indore",
  "bhopal",
  "jabalpur",
  "ujjain",
  "dewas",
  "satna",
  "sagar",
  "rewa",
  "ratlam",
];

// Display names for cities
export const CITY_DISPLAY_NAMES: Record<string, string> = {
  gwalior: "Gwalior",
  indore: "Indore",
  bhopal: "Bhopal",
  jabalpur: "Jabalpur",
  ujjain: "Ujjain",
  dewas: "Dewas",
  satna: "Satna",
  sagar: "Sagar",
  rewa: "Rewa",
  ratlam: "Ratlam",
};

// Canonical city-centre coordinates used by statically generated city pages.
// User-selected locations carry their exact coordinates in the URL instead.
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  gwalior: { lat: 26.2183, lng: 78.1828 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  jabalpur: { lat: 23.1815, lng: 79.9864 },
  ujjain: { lat: 23.1765, lng: 75.7885 },
  dewas: { lat: 22.9676, lng: 76.0534 },
  satna: { lat: 24.6005, lng: 80.8322 },
  sagar: { lat: 23.8388, lng: 78.7378 },
  rewa: { lat: 24.5362, lng: 81.3037 },
  ratlam: { lat: 23.3342, lng: 75.0376 },
};

// Service categories for SEO
export const SERVICE_CATEGORIES = [
  "plumbing",
  "electrical",
  "cleaning",
  "gardening",
  "painting",
  "carpentry",
  "ac-repair",
  "pest-control",
  "home-repair",
  "transportation",
  "healthcare",
  "education",
  "beauty",
  "fitness",
];

// Display names for services
export const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  gardening: "Gardening",
  painting: "Painting",
  carpentry: "Carpentry",
  "ac-repair": "AC Repair",
  "pest-control": "Pest Control",
  "home-repair": "Home Repair",
  transportation: "Transportation",
  healthcare: "Healthcare",
  education: "Education",
  beauty: "Beauty",
  fitness: "Fitness",
};

// API category names (how they're stored in DB)
export const SERVICE_API_NAMES: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  gardening: "Gardening",
  painting: "Painting",
  carpentry: "Carpentry",
  "ac-repair": "AC Repair",
  "pest-control": "Pest Control",
  "home-repair": "Home Repair",
  transportation: "Transportation",
  healthcare: "Healthcare",
  education: "Education",
  beauty: "Beauty",
  fitness: "Fitness",
};

// Helper functions
export function isValidCity(city: string): boolean {
  return TARGET_CITIES.includes(city.toLowerCase());
}

export function isValidService(service: string): boolean {
  return SERVICE_CATEGORIES.includes(service.toLowerCase());
}

export function getCityDisplayName(city: string): string {
  return CITY_DISPLAY_NAMES[city.toLowerCase()] || formatCityName(city);
}

export function getServiceDisplayName(service: string): string {
  return SERVICE_DISPLAY_NAMES[service.toLowerCase()] || formatServiceName(service);
}

function formatCityName(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatServiceName(service: string): string {
  return service
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Get city slug from city name (e.g. "Gwalior" -> "gwalior")
export function getCitySlug(cityName: string): string {
  const slug = cityName.toLowerCase().trim().replace(/\s+/g, "-");
  // If it's a known city, return that slug; otherwise return formatted slug
  if (TARGET_CITIES.includes(slug)) {
    return slug;
  }
  // Check if any TARGET_CITY matches the display name
  for (const [key, displayName] of Object.entries(CITY_DISPLAY_NAMES)) {
    if (displayName.toLowerCase() === cityName.toLowerCase()) {
      return key;
    }
  }
  return slug;
}
