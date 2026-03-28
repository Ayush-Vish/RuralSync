import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat or lng parameter" },
      { status: 400 }
    );
  }

  // Normalize to reduce cache duplication
  const latNum = Number.parseFloat(lat).toFixed(5);
  const lngNum = Number.parseFloat(lng).toFixed(5);

  const cacheKey = `reverse:${latNum}:${lngNum}`;

  try {
    let cacheAvailable = true;

    // Cache and rate limiting are optional. Local development should still work
    // even when Vercel KV is not configured.
    try {
      const cached = await kv.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

      const rateKey = `rate:reverse:${ip}`;
      const count = (await kv.get<number>(rateKey)) || 0;

      if (count > 30) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 }
        );
      }

      await kv.set(rateKey, count + 1, { ex: 60 });
    } catch (kvError) {
      cacheAvailable = false;
      console.warn("Reverse geocode KV unavailable, continuing without cache:", kvError);
    }

    // ================================
    // 3️⃣ Call OSM
    // ================================
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&addressdetails=1`,
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
    // 4️⃣ Extract relevant info
    // ================================
    const result = {
      displayName: data.display_name,
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        null,
      state: data.address?.state || null,
      country: data.address?.country || null,
      postcode: data.address?.postcode || null,
      lat: Number(latNum),
      lng: Number(lngNum),
    };

    if (cacheAvailable) {
      try {
        await kv.set(cacheKey, result, { ex: 60 * 60 * 24 * 30 });
      } catch (kvError) {
        console.warn("Reverse geocode KV write failed:", kvError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}
