import type { NextRequest } from "next/server";
import { ADSB_LOL_URL } from "@/lib/constants";

export const runtime = "edge";
export const preferredRegion = ["fra1", "sfo1", "iad1"];

interface ADSBLolAircraft {
  hex: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | string;
  alt_geom?: number;
  gs?: number;
  track?: number;
  true_heading?: number;
  squawk?: string;
  emergency?: string;
  category?: string;
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

function parseADSBLol(ac: ADSBLolAircraft[]): ParsedState[] {
  const now = Math.floor(Date.now() / 1000);
  return ac
    .filter((a) => a.lat != null && a.lon != null)
    .map((a) => ({
      icao24: a.hex,
      callsign: a.flight?.trim() || null,
      origin_country: "Unknown",
      time_position: now,
      last_contact: now,
      longitude: a.lon!,
      latitude: a.lat!,
      baro_altitude:
        typeof a.alt_baro === "number" ? a.alt_baro * 0.3048 : null,
      on_ground: a.alt_baro === "ground" || (!a.alt_baro && a.gs && a.gs < 5),
      velocity: a.gs ? a.gs * 0.514444 : null,
      true_track: a.track || null,
      vertical_rate: null,
      geo_altitude: a.alt_geom ? a.alt_geom * 0.3048 : null,
      squawk: a.squawk || null,
      spi: a.emergency === "general" || a.emergency === "medical",
      position_source: 0,
      category: 0,
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

  const centerLat = (lamin + lamax) / 2;
  const centerLon = (lomin + lomax) / 2;
  const distance = Math.max(
    Math.abs(lamax - lamin),
    Math.abs(lomax - lomin)
  ) * 60;

  const url = `${ADSB_LOL_URL}/${centerLat}/${centerLon}/${Math.min(distance, 500)}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.log(`[adsb.lol] ${res.status}`);
      return Response.json(
        { error: `adsb.lol returned ${res.status}`, states: [] },
        { status: 502 }
      );
    }

    const data = await res.json();
    const states = data.ac ? parseADSBLol(data.ac) : [];
    console.log(`[adsb.lol] OK: ${states.length} aircraft`);

    return Response.json(
      {
        time: Math.floor(Date.now() / 1000),
        states,
        mode: "adsb.lol",
      },
      {
        headers: {
          "Cache-Control": "s-maxage=10, stale-while-revalidate=5",
        },
      }
    );
  } catch (e) {
    console.error("[adsb.lol] Fetch error:", e);
    return Response.json(
      { error: "Aircraft data service unavailable", states: [] },
      { status: 503 }
    );
  }
}
