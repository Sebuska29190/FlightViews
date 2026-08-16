"use client";

import { useMemo } from "react";
import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useStore } from "@/store/useStore";
import type { Ship } from "@/lib/types";
import { getShipTypeName } from "@/lib/utils";

const MAX_VISIBLE_SHIPS = 500;

function getShipColor(status: number | null | undefined): string {
  if (status === null || status === undefined) return "#06b6d4";
  if (status === 0) return "#22c55e";
  if (status === 1 || status === 2 || status === 3) return "#ef4444";
  if (status === 5) return "#a855f7";
  return "#06b6d4";
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
    const remaining = MAX_VISIBLE_SHIPS - favs.length;

    return [...favs, ...nonFavs.slice(0, Math.max(0, remaining))];
  }, [ships, layerMode, searchQuery, favorites]);

  if (filtered.length === 0) return null;

  return (
    <>
      {filtered.map((s) => {
        if (!s.latitude || !s.longitude) return null;
        const isFav = favorites.has(`mmsi-${s.mmsi}`);
        const color = getShipColor(s.navigational_status);

        return (
          <CircleMarker
            key={`ship-${s.mmsi}`}
            center={[s.latitude, s.longitude]}
            radius={isFav ? 7 : 5}
            pathOptions={{
              color: isFav ? "#f59e0b" : color,
              fillColor: isFav ? "#f59e0b" : color,
              fillOpacity: 0.7,
              weight: isFav ? 3 : 1,
            }}
            eventHandlers={{
              click: () => {
                selectShip(s);
                map.flyTo([s.latitude, s.longitude], Math.max(map.getZoom(), 9), {
                  duration: 0.5,
                });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs">
                <div className="font-bold">{s.ship_name || `MMSI ${s.mmsi}`}</div>
                {s.sog !== null ? <div>{s.sog.toFixed(1)} kt</div> : null}
                {s.cog !== null ? <div>COG {s.cog}&deg;</div> : null}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
