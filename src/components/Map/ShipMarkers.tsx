"use client";

import { useMemo } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useStore } from "@/store/useStore";
import type { Ship } from "@/lib/types";

const MAX_MARKERS = 500;

function getShipStatusColor(status: number | null | undefined): string {
  if (status === null || status === undefined) return "#64748b";
  if (status >= 1 && status <= 3) return "#ef4444";
  if (status === 0) return "#22c55e";
  if (status === 5) return "#f59e0b";
  if (status === 7) return "#06b6d4";
  if (status === 8) return "#8b5cf6";
  return "#3b82f6";
}

function createShipIcon(rotation: number, color: string, size: number): L.DivIcon {
  const svg = `
    <div class="ship-marker" style="transform: rotate(${rotation}deg); width: ${size}px; height: ${size}px;">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <path d="M12 2L4 18H20L12 2Z" 
              fill="${color}" 
              stroke="rgba(255,255,255,0.8)" 
              stroke-width="1.5"
              stroke-linejoin="round"/>
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

export function ShipMarkers() {
  const ships = useStore((s) => s.ships);
  const layerMode = useStore((s) => s.layerMode);
  const searchQuery = useStore((s) => s.searchQuery);
  const favorites = useStore((s) => s.favorites);
  const selectShip = useStore((s) => s.selectShip);
  const map = useMap();

  const filtered = useMemo(() => {
    if (layerMode === "aircraft") return [];

    let arr = Array.from(ships.values());

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(
        (s) =>
          (s.ship_name && s.ship_name.toLowerCase().includes(q)) ||
          s.mmsi.toString().includes(q) ||
          (s.callsign && s.callsign.toLowerCase().includes(q))
      );
    }

    const favs = arr.filter((s) => favorites.has(`mmsi-${s.mmsi}`));
    const nonFavs = arr.filter((s) => !favorites.has(`mmsi-${s.mmsi}`));
    return [...favs, ...nonFavs.slice(0, MAX_MARKERS - favs.length)];
  }, [ships, layerMode, searchQuery, favorites]);

  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    filtered.forEach((s) => {
      const rotation = s.true_heading ?? s.cog ?? 0;
      const color = getShipStatusColor(s.navigational_status);
      const size = 18;
      const key = `${Math.round(rotation / 10) * 10}-${color}-${size}`;
      if (!cache.has(key)) {
        cache.set(key, createShipIcon(rotation, color, size));
      }
    });
    return cache;
  }, [filtered]);

  if (filtered.length === 0) return null;

  return (
    <>
      {filtered.map((s) => {
        if (!s.latitude || !s.longitude) return null;
        const rotation = s.true_heading ?? s.cog ?? 0;
        const color = getShipStatusColor(s.navigational_status);
        const size = 18;
        const key = `${Math.round(rotation / 10) * 10}-${color}-${size}`;
        const icon = icons.get(key)!;
        const isFav = favorites.has(`mmsi-${s.mmsi}`);

        return (
          <Marker
            key={`ship-${s.mmsi}`}
            position={[s.latitude, s.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                selectShip(s);
                map.flyTo([s.latitude, s.longitude], Math.max(map.getZoom(), 10), {
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
                <div className="font-bold text-sm">{s.ship_name || `MMSI ${s.mmsi}`}</div>
                {s.ship_name && <div className="text-[10px] text-gray-400">MMSI {s.mmsi}</div>}
                {s.sog !== null && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-cyan-400">→</span>
                    <span>{s.sog.toFixed(1)} kt</span>
                  </div>
                )}
                {s.cog !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">↗</span>
                    <span>{s.cog.toFixed(0)}°</span>
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
