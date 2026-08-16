"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export function FavoriteNotifier() {
  const aircraft = useStore((s) => s.aircraft);
  const ships = useStore((s) => s.ships);
  const favorites = useStore((s) => s.favorites);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (favorites.size === 0) return;

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const newFavorites: string[] = [];

    for (const a of aircraft) {
      if (favorites.has(a.icao24) && !notifiedRef.current.has(a.icao24)) {
        notifiedRef.current.add(a.icao24);
        newFavorites.push(a.callsign || a.icao24);
      }
    }

    for (const [mmsi] of ships) {
      const key = `mmsi-${mmsi}`;
      if (favorites.has(key) && !notifiedRef.current.has(key)) {
        notifiedRef.current.add(key);
        newFavorites.push(`Ship MMSI ${mmsi}`);
      }
    }

    if (newFavorites.length > 0 && newFavorites.length <= 5) {
      new Notification("SkySea Tracker", {
        body: `Tracked: ${newFavorites.join(", ")}`,
        icon: "/icon-192.png",
      });
    }
  }, [aircraft, ships, favorites]);

  return null;
}
