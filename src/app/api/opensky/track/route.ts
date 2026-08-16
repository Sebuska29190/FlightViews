import type { NextRequest } from "next/server";
import { fetchTrack } from "@/lib/opensky";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const icao24 = searchParams.get("icao24");

  if (!icao24) {
    return Response.json({ error: "icao24 required" }, { status: 400 });
  }

  const track = await fetchTrack(icao24.toLowerCase());

  if (track === null) {
    return Response.json(
      { error: "Track not available", path: [] },
      { status: 200 }
    );
  }

  return Response.json(track, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=20" },
  });
}
