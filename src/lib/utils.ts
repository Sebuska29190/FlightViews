import type { BoundingBox, WeatherData } from "./types";
import { OPENMETEO_URL, WEATHER_CODES, SHIP_TYPES } from "./constants";

export function formatSpeed(speed: number | null): string {
  if (speed === null || speed === undefined) return "N/A";
  return `${(speed * 3.6).toFixed(0)} km/h`;
}

export function formatSpeedKnots(speed: number | null): string {
  if (speed === null || speed === undefined) return "N/A";
  return `${(speed * 1.94384).toFixed(0)} kt`;
}

export function formatAltitude(alt: number | null): string {
  if (alt === null || alt === undefined) return "N/A";
  return `${alt.toFixed(0)} m / ${(alt * 3.28084).toFixed(0)} ft`;
}

export function formatHeading(track: number | null): string {
  if (track === null || track === undefined) return "N/A";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(track / 45) % 8;
  return `${track.toFixed(0)}° ${dirs[idx]}`;
}

export function boundingBoxArea(bb: BoundingBox): number {
  return (bb.lamax - bb.lamin) * (bb.lomax - bb.lomin);
}

export function creditCostForArea(area: number): number {
  if (area <= 25) return 1;
  if (area <= 100) return 2;
  if (area <= 400) return 3;
  return 4;
}

export function weatherCodeToString(code: number): string {
  return WEATHER_CODES[code] || "Unknown";
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const url = `${OPENMETEO_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,relative_humidity_2m,pressure_msl,cloud_cover&wind_speed_unit=kmh`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.current as WeatherData;
  } catch {
    return null;
  }
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function getShipTypeName(type: number | undefined): string {
  if (!type) return "Unknown";
  const base = Math.floor(type / 10) * 10;
  return SHIP_TYPES[base] || SHIP_TYPES[type] || "Unknown";
}
