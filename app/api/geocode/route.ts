import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geocoding";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json([]);
  }

  const data = await searchPlaces(q, { limit: 6 });
  return NextResponse.json(data);
}
