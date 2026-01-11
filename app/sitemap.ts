import { MetadataRoute } from "next";
import {
  TARGET_CITIES,
  SERVICE_CATEGORIES,
} from "@/lib/seo-constants";

const BASE_URL = "https://ruralsync.vercel.app";

// Try to fetch dynamic categories from API
async function fetchCategories(): Promise<string[]> {
  try {
    const API_BASE =
      process.env.NODE_ENV === "production"
        ? "https://ruralsyncapi.vercel.app"
        : "http://localhost:5000";

    const response = await fetch(`${API_BASE}/api/client/search/categories`, {
      next: { revalidate: 86400 }, // Revalidate once a day
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        // Convert API categories to URL-friendly slugs
        return data.categories.map((cat: string) =>
          cat.toLowerCase().replace(/\s+/g, "-")
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }

  // Fallback to predefined categories
  return SERVICE_CATEGORIES;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchCategories();
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/providers`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic city + service landing pages
  const cityServicePages: MetadataRoute.Sitemap = [];

  for (const city of TARGET_CITIES) {
    for (const service of categories) {
      cityServicePages.push({
        url: `${BASE_URL}/${city}/${service}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // City landing pages (high priority for local SEO)
  const cityPages: MetadataRoute.Sitemap = TARGET_CITIES.map((city) => ({
    url: `${BASE_URL}/${city}`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // City search pages
  const citySearchPages: MetadataRoute.Sitemap = TARGET_CITIES.map((city) => ({
    url: `${BASE_URL}/${city}/search`,
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/search?category=${category}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...citySearchPages, ...cityServicePages, ...categoryPages];
}
