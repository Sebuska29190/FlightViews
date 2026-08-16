"use client";

import { Polyline } from "react-leaflet";
import { useStore } from "@/store/useStore";

export function TrackPolyline() {
  const trackPath = useStore((s) => s.trackPath);

  if (!trackPath || trackPath.length < 2) return null;

  return (
    <Polyline
      positions={trackPath}
      pathOptions={{
        color: "#f59e0b",
        weight: 2.5,
        opacity: 0.8,
        dashArray: "8, 6",
      }}
    />
  );
}
