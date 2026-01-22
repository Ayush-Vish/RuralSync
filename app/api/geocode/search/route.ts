import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = searchParams.get("limit") || "5";

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  // Normalize query to improve cache hits
  const normalizedQ = q.trim().toLowerCase();
  const normalizedLimit = Number(limit) || 5;

  const cacheKey = `search:${normalizedQ}:${normalizedLimit}`;

  try {
    // ================================
    // 1️⃣ Check cache
    // ================================
    const cached = await kv.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ================================
    // 2️⃣ Simple rate limit (per IP)
    // ================================
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    const rateKey = `rate:search:${ip}`;
    const count = (await kv.get<number>(rateKey)) || 0;

    if (count > 60) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    await kv.set(rateKey, count + 1, { ex: 60 }); // 60 per minute

    // ================================
    // 3️⃣ Call OSM
    // ================================
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        normalizedQ
      )}&limit=${normalizedLimit}&addressdetails=1&countrycodes=in`,
      {
        headers: {
          "User-Agent": "RuralSync/1.0 (https://ruralsync.vercel.app)",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Nominatim API error");
    }

    const data = await response.json();

    // ================================
    // 4️⃣ Map to cleaner format
    // ================================
    const results = data.map((item: any) => ({
      placeId: item.place_id?.toString() || "",
      displayName: item.display_name,
      city:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality ||
        item.address?.county ||
        item.address?.state_district ||
        "",
      state: item.address?.state || "",
      country: item.address?.country || "",
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || "",
    }));

    // ================================
    // 5️⃣ Save to cache (7 days)
    // ================================
    await kv.set(cacheKey, results, { ex: 60 * 60 * 24 * 7 });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode" },
      { status: 500 }
    );
  }
}
