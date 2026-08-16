import type { NextRequest } from "next/server";

export const runtime = "edge";
export const preferredRegion = ["fra1", "sfo1", "iad1"];

interface TokenData {
  access_token: string;
  expires_at: number;
}

let cachedToken: TokenData | null = null;

async function getToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
        signal: ctrl.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in || 1800) * 1000,
    };
    return cachedToken.access_token;
  } catch {
    return null;
  }
}

interface ParsedState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category: number;
}

function parseStateVectors(raw: unknown[][]): ParsedState[] {
  return raw
    .filter((s) => s[5] != null && s[6] != null)
    .map((s) => ({
      icao24: s[0] as string,
      callsign: s[1] ? (s[1] as string).trim() : null,
      origin_country: s[2] as string,
      time_position: s[3] as number | null,
      last_contact: s[4] as number,
      longitude: s[5] as number | null,
      latitude: s[6] as number | null,
      baro_altitude: s[7] as number | null,
      on_ground: Boolean(s[8]),
      velocity: s[9] as number | null,
      true_track: s[10] as number | null,
      vertical_rate: s[11] as number | null,
      geo_altitude: s[13] as number | null,
      squawk: s[14] as string | null,
      spi: Boolean(s[15]),
      position_source: (s[16] as number) || 0,
      category: (s[17] as number) || 0,
    }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lamin = parseFloat(searchParams.get("lamin") || "0");
  const lomin = parseFloat(searchParams.get("lomin") || "0");
  const lamax = parseFloat(searchParams.get("lamax") || "0");
  const lomax = parseFloat(searchParams.get("lomax") || "0");

  if (!lamin || !lomin || !lamax || !lomax) {
    return Response.json({ error: "Bounding box required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    lamin: lamin.toFixed(4),
    lomin: lomin.toFixed(4),
    lamax: lamax.toFixed(4),
    lomax: lomax.toFixed(4),
  });
  const url = `https://opensky-network.org/api/states/all?${params}`;

  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.log(`[OpenSky] ${token ? "auth" : "anon"} -> ${res.status}`);
      return Response.json({ error: `OpenSky returned ${res.status}`, states: [] }, { status: 502 });
    }

    const data = await res.json();
    const states = data.states ? parseStateVectors(data.states) : [];
    console.log(`[OpenSky] OK: ${states.length} states (${token ? "auth" : "anon"})`);

    return Response.json(
      { time: data.time, states, mode: token ? "authenticated" : "anonymous" },
      { headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=5" } }
    );
  } catch (e) {
    console.error("[OpenSky] Fetch error:", e);
    return Response.json(
      { error: "OpenSky API unreachable from this server", states: [] },
      { status: 503 }
    );
  }
}
