"use client";

import { useMemo } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useStore } from "@/store/useStore";
import type { Aircraft } from "@/lib/types";

const MAX_MARKERS = 500;

function getAltitudeColor(alt: number | null): string {
  if (alt === null) return "#94a3b8";
  if (alt === 0) return "#64748b";
  if (alt < 3000) return "#fbbf24";
  if (alt < 10000) return "#22c55e";
  if (alt < 25000) return "#06b6d4";
  if (alt < 35000) return "#3b82f6";
  return "#8b5cf6";
}

function createAircraftIcon(rotation: number, color: string, isOnGround: boolean): L.DivIcon {
  const size = isOnGround ? 18 : 24;
  const svg = `
    <div class="aircraft-marker" style="transform: rotate(${rotation}deg); width: ${size}px; height: ${size}px;">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <path d="M12 2L8 8L2 10L8 12L12 22L16 12L22 10L16 8L12 2Z" 
              fill="${color}" 
              stroke="${isOnGround ? '#000' : 'rgba(255,255,255,0.8)'}" 
              stroke-width="1"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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
    return [...favs, ...nonFavs.slice(0, MAX_MARKERS - favs.length)];
  }, [aircraft, layerMode, filters, searchQuery, favorites]);

  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    filtered.forEach((a) => {
      const rotation = a.true_track || 0;
      const color = getAltitudeColor(a.baro_altitude);
      const key = `${Math.round(rotation / 5) * 5}-${color}-${a.on_ground}`;
      if (!cache.has(key)) {
        cache.set(key, createAircraftIcon(rotation, color, a.on_ground));
      }
    });
    return cache;
  }, [filtered]);

  if (filtered.length === 0) return null;

  return (
    <>
      {filtered.map((a) => {
        if (!a.latitude || !a.longitude) return null;
        const rotation = a.true_track || 0;
        const color = getAltitudeColor(a.baro_altitude);
        const key = `${Math.round(rotation / 5) * 5}-${color}-${a.on_ground}`;
        const icon = icons.get(key)!;
        const isFav = favorites.has(a.icao24);

        return (
          <Marker
            key={a.icao24}
            position={[a.latitude, a.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                selectAircraft(a);
                map.flyTo([a.latitude!, a.longitude!], Math.max(map.getZoom(), 9), {
                  duration: 0.6,
                  easeLinearity: 0.5,
                });
              },
            }}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -12]} 
              opacity={0.95}
              className="glass-tooltip"
            >
              <div className="text-xs font-medium p-1">
                <div className="font-bold text-sm">{a.callsign || a.icao24.toUpperCase()}</div>
                {a.callsign && <div className="text-[10px] text-gray-400">{a.icao24.toUpperCase()}</div>}
                {a.baro_altitude && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-blue-400">↑</span>
                    <span>{(a.baro_altitude * 3.28).toFixed(0)} ft</span>
                  </div>
                )}
                {a.velocity && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">→</span>
                    <span>{(a.velocity * 1.94384).toFixed(0)} kt</span>
                  </div>
                )}
                {isFav && <div className="mt-1 text-yellow-400">★ Favorite</div>}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
