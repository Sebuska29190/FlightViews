"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { REFRESH_INTERVAL, BOUNDING_BOX_DEBOUNCE } from "@/lib/constants";
import type { Aircraft } from "@/lib/types";

export function AircraftFetcher() {
  const mapBounds = useStore((s) => s.mapBounds);
  const setAircraft = useStore((s) => s.setAircraft);
  const setLoadingAircraft = useStore((s) => s.setLoadingAircraft);
  const setApiError = useStore((s) => s.setApiError);
  const lastFetchRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mapBounds) return;

    const fetchAircraft = async () => {
      const now = Date.now();
      if (now - lastFetchRef.current < REFRESH_INTERVAL) return;
      lastFetchRef.current = now;

      setLoadingAircraft(true);
      try {
        const params = new URLSearchParams({
          lamin: mapBounds.lamin.toFixed(3),
          lomin: mapBounds.lomin.toFixed(3),
          lamax: mapBounds.lamax.toFixed(3),
          lomax: mapBounds.lomax.toFixed(3),
        });
        const res = await fetch(`/api/opensky/states?${params}`);
        const data = await res.json();

        if (res.ok && data.states) {
          setAircraft(data.states as Aircraft[]);
          setApiError(null);
        } else {
          setApiError(data.error || "Failed to fetch aircraft");
        }
      } catch {
        setApiError("Network error fetching aircraft");
      }
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetchAircraft, BOUNDING_BOX_DEBOUNCE);

    const interval = setInterval(() => {
      if (mapBounds) fetchAircraft();
    }, REFRESH_INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [mapBounds, setAircraft, setLoadingAircraft, setApiError]);

  return null;
}
