"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, REFRESH_INTERVAL } from "@/lib/constants";
import { useStore } from "@/store/useStore";
import { AircraftMarkers } from "./AircraftMarkers";
import { ShipMarkers } from "./ShipMarkers";
import { TrackPolyline } from "./TrackPolyline";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function BoundsTracker() {
  const setMapBounds = useStore((s) => s.setMapBounds);
  const map = useMap();

  const updateBounds = useCallback(() => {
    const b = map.getBounds();
    setMapBounds({
      lamin: b.getSouthWest().lat,
      lomin: b.getSouthWest().lng,
      lamax: b.getNorthEast().lat,
      lomax: b.getNorthEast().lng,
    });
  }, [map, setMapBounds]);

  useMapEvents({
    moveend: updateBounds,
    zoomend: updateBounds,
  });

  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  return null;
}

export function MapView() {
  const darkMode = useStore((s) => s.darkMode);

  const tiles = useMemo(() => {
    if (darkMode) {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  }, [darkMode]);

  const attribution = useMemo(() => {
    if (darkMode) {
      return '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/copyright">OSM</a>';
    }
    return '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
  }, [darkMode]);

  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={true}
      className="w-full h-full"
      preferCanvas={true}
    >
      <TileLayer url={tiles} attribution={attribution} />
      <BoundsTracker />
      <AircraftMarkers />
      <ShipMarkers />
      <TrackPolyline />
    </MapContainer>
  );
}
