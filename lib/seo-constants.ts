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
