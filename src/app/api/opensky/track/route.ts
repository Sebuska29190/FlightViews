import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const icao24 = searchParams.get("icao24");

  if (!icao24) {
    return Response.json({ error: "icao24 required" }, { status: 400 });
  }

  const token = process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET;
  const headers: Record<string, string> = {};

  if (token) {
    try {
      const tokenRes = await fetch(
        "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `grant_type=client_credentials&client_id=${encodeURIComponent(process.env.OPENSKY_CLIENT_ID)}&client_secret=${encodeURIComponent(process.env.OPENSKY_CLIENT_SECRET)}`,
        }
      );
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        headers.Authorization = `Bearer ${data.access_token}`;
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `https://opensky-network.org/api/tracks/all?icao24=${icao24.toLowerCase()}&time=0`,
      { headers }
    );
    if (!res.ok) {
      return Response.json({ error: "Track unavailable", path: [] });
    }
    const data = await res.json();
    return Response.json(data, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=20" },
    });
  } catch {
    return Response.json({ error: "Track service unavailable", path: [] }, { status: 503 });
  }
}
