import type { NextRequest } from "next/server";
import { fetchStates } from "@/lib/opensky";

export const runtime = "nodejs";
export const revalidate = 8;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lamin = parseFloat(searchParams.get("lamin") || "0");
  const lomin = parseFloat(searchParams.get("lomin") || "0");
  const lamax = parseFloat(searchParams.get("lamax") || "0");
  const lomax = parseFloat(searchParams.get("lomax") || "0");

  if (!lamin || !lomin || !lamax || !lomax) {
    return Response.json({ error: "Bounding box required" }, { status: 400 });
  }

  const states = await fetchStates(lamin, lomin, lamax, lomax);

  if (states === null) {
    return Response.json(
      {
        error: "OpenSky API unavailable - may be blocking AWS IPs. Try again in 10s.",
        states: [],
        mode: "error",
      },
      { status: 503 }
    );
  }

  return Response.json(
    {
      time: Math.floor(Date.now() / 1000),
      states,
      mode: process.env.OPENSKY_CLIENT_ID ? "authenticated" : "anonymous",
    },
    {
      headers: {
        "Cache-Control": "s-maxage=10, stale-while-revalidate=5",
      },
    }
  );
}
