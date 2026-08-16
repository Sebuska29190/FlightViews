"use client";

import { useMemo } from "react";
import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useStore } from "@/store/useStore";
import type { Aircraft } from "@/lib/types";

const MAX_VISIBLE_MARKERS = 500;

function getAircraftColor(a: Aircraft): string {
  if (a.on_ground) return "#94a3b8";
  if (a.category === 8) return "#a855f7";
  if (a.velocity && a.velocity > 250) return "#ef4444";
  if (a.velocity && a.velocity > 150) return "#f59e0b";
  return "#3b82f6";
}

export function AircraftMarkers() {
  const aircraft = useStore((s) => s.aircraft);
  const layerMode = useStore((s) => s.layerMode);
  const filters = useStore((s) => s.filters);
  const searchQuery = useStore((s) => s.searchQuery);
  const favorites = useStore((s) => s.favorites);
  const selectAircraft = useStore((s) => s.selectAircraft);
  const map = useMap();

  const filtered = useMemo(() => {
    if (layerMode === "ships") return [];

    let result = aircraft;

    if (filters.airborne_only) result = result.filter((a) => !a.on_ground);
    if (filters.on_ground_only) result = result.filter((a) => a.on_ground);
    if (filters.min_altitude !== null)
      result = result.filter((a) => (a.baro_altitude || 0) >= filters.min_altitude!);
    if (filters.max_altitude !== null)
      result = result.filter((a) => (a.baro_altitude || 0) <= filters.max_altitude!);
    if (filters.min_speed !== null)
      result = result.filter((a) => (a.velocity || 0) >= filters.min_speed!);
    if (filters.country)
      result = result.filter((a) =>
        a.origin_country.toLowerCase().includes(filters.country!.toLowerCase())
      );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.callsign && a.callsign.toLowerCase().includes(q)) ||
          a.icao24.toLowerCase().includes(q) ||
          a.squawk === q
      );
    }

    const favs = result.filter((a) => favorites.has(a.icao24));
    const nonFavs = result.filter((a) => !favorites.has(a.icao24));
    const remaining = MAX_VISIBLE_MARKERS - favs.length;

    return [...favs, ...nonFavs.slice(0, Math.max(0, remaining))];
  }, [aircraft, layerMode, filters, searchQuery, favorites]);

  if (filtered.length === 0) return null;

  return (
    <>
      {filtered.map((a) => {
        if (!a.latitude || !a.longitude) return null;
        const isFav = favorites.has(a.icao24);
        const color = getAircraftColor(a);
        const radius = isFav ? 8 : a.on_ground ? 4 : 6;

        return (
          <CircleMarker
            key={a.icao24}
            center={[a.latitude, a.longitude]}
            radius={radius}
            pathOptions={{
              color: isFav ? "#f59e0b" : color,
              fillColor: isFav ? "#f59e0b" : color,
              fillOpacity: 0.85,
              weight: isFav ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => {
                selectAircraft(a);
                map.flyTo([a.latitude!, a.longitude!], Math.max(map.getZoom(), 8), {
                  duration: 0.5,
                });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs">
                <div className="font-bold">{a.callsign || a.icao24}</div>
                <div>{a.origin_country}</div>
                {a.baro_altitude ? <div>{(a.baro_altitude * 3.28).toFixed(0)} ft</div> : null}
                {a.velocity ? <div>{(a.velocity * 3.6).toFixed(0)} km/h</div> : null}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
