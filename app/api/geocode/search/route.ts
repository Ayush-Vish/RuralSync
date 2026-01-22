import { NextResponse } from "next/server";

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

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=${limit}&addressdetails=1&countrycodes=in`,
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

    // Map to cleaner format with all required fields
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

    return NextResponse.json(results);
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode" },
      { status: 500 }
    );
  }
}
