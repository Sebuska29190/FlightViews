"use client";

import { useEffect, useState } from "react";
import { 
  X, ExternalLink, Star, MapPin, Navigation, 
  Gauge, TrendingUp, Clock, Flag, Radio, 
  Thermometer, Wind, Droplets, Cloud, 
  Route, Plane, Ship, AlertCircle
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatSpeedKnots, formatAltitude, formatHeading, fetchWeather, weatherCodeToString } from "@/lib/utils";
import type { WeatherData } from "@/lib/types";

const AIRCRAFT_CATEGORIES: Record<number, string> = {
  0: "Unknown", 1: "No Info", 2: "Light", 3: "Small", 4: "Large",
  5: "High Vortex", 6: "Heavy", 7: "High Performance", 8: "Rotorcraft",
  9: "Glider", 10: "Lighter-than-air", 11: "Parachutist", 14: "UAV", 15: "Space"
};

const NAV_STATUSES: Record<number, string> = {
  0: "Under way (engine)", 1: "At anchor", 2: "Not under command", 
  3: "Restricted manoeuvrability", 4: "Constrained by draught",
  5: "Moored", 6: "Aground", 7: "Engaged in fishing", 
  8: "Under way (sailing)", 15: "Undefined"
};

function DataField({ icon, label, value, color = "" }: { 
  icon: React.ReactNode; label: string; value: string; color?: string 
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)] hover:bg-[var(--bg-tertiary)] transition-colors duration-200">
      <div className={`p-2 rounded-lg bg-[var(--bg-primary)]/80 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{label}</div>
        <div className="text-sm font-semibold truncate mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function DetailPanel() {
  const { selectedAircraft, selectedShip, selectAircraft, selectShip, favorites, toggleFavorite, setTrack } = useStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    setWeather(null);
    const target = selectedAircraft || selectedShip;
    if (!target) return;

    setIsLoadingWeather(true);
    const lat = selectedAircraft ? selectedAircraft.latitude! : selectedShip!.latitude;
    const lon = selectedAircraft ? selectedAircraft.longitude! : selectedShip!.longitude;
    
    fetchWeather(lat, lon).then((w) => {
      setWeather(w);
      setIsLoadingWeather(false);
    });
  }, [selectedAircraft, selectedShip]);

  useEffect(() => {
    return () => {
      setWeather(null);
    };
  }, []);

  const handleLoadTrack = async () => {
    if (!selectedAircraft) return;
    setTrackLoading(true);
    try {
      const res = await fetch(`/api/opensky/track?icao24=${selectedAircraft.icao24}`);
      if (res.ok) {
        const data = await res.json();
        if (data.path && data.path.length > 1) {
          setTrack(selectedAircraft.icao24, data.path.map((p: number[]) => [p[1], p[2]]));
        }
      }
    } catch {}
    setTrackLoading(false);
  };

  const handleClose = () => {
    selectAircraft(null);
    selectShip(null);
    setTrack(null, []);
  };

  if (!selectedAircraft && !selectedShip) return null;

  const isAircraft = !!selectedAircraft;
  const id = isAircraft ? selectedAircraft!.icao24 : `mmsi-${selectedShip!.mmsi}`;
  const isFav = favorites.has(id);
  const name = isAircraft 
    ? (selectedAircraft!.callsign || selectedAircraft!.icao24.toUpperCase())
    : (selectedShip!.ship_name || `Vessel ${selectedShip!.mmsi}`);
  const subtitle = isAircraft 
    ? `${selectedAircraft!.icao24.toUpperCase()} • ${selectedAircraft!.origin_country}`
    : `MMSI ${selectedShip!.mmsi}${selectedShip!.callsign ? ` • ${selectedShip.callsign}` : ""}`;

  return (
    <div className="slide-in">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-[var(--border-glass)] glass-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[var(--accent)]/20">
                {isAircraft ? <Plane size={16} className="text-[var(--accent)]" /> : <Ship size={16} className="text-cyan-400" />}
              </div>
              <h2 className="text-xl font-bold truncate">{name}</h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => toggleFavorite(id)} 
              className="p-2 rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all duration-200"
            >
              <Star 
                size={18} 
                className={`transition-all duration-300 ${isFav ? "fill-yellow-400 text-yellow-400 scale-110" : ""}`} 
              />
            </button>
            <button 
              onClick={handleClose} 
              className="p-2 rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {isAircraft && (
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleLoadTrack} 
              disabled={trackLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors duration-200"
            >
              <Route size={14} /> 
              {trackLoading ? "Loading..." : "Track History"}
            </button>
            <a 
              href={`https://www.flightradar24.com/${selectedAircraft!.icao24}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-xl text-xs font-medium hover:bg-[var(--bg-glass-hover)] transition-colors duration-200 border border-[var(--border-glass)]"
            >
              <ExternalLink size={14} /> FR24
            </a>
          </div>
        )}
      </div>

      {/* Data Grid */}
      <div className="p-4 space-y-3">
        {isAircraft && selectedAircraft && (
          <>
            <DataField icon={<TrendingUp size={14} />} label="Altitude" value={formatAltitude(selectedAircraft.baro_altitude)} color="text-purple-400" />
            <DataField icon={<Gauge size={14} />} label="Ground Speed" value={formatSpeedKnots(selectedAircraft.velocity)} color="text-green-400" />
            <DataField icon={<Navigation size={14} />} label="Heading" value={formatHeading(selectedAircraft.true_track)} color="text-blue-400" />
            <DataField icon={<Radio size={14} />} label="Vertical Rate" value={selectedAircraft.vertical_rate ? `${selectedAircraft.vertical_rate.toFixed(1)} m/s` : "Level"} color="text-cyan-400" />
            <DataField icon={<MapPin size={14} />} label="Status" value={selectedAircraft.on_ground ? "On Ground" : "In Flight"} color={selectedAircraft.on_ground ? "text-gray-400" : "text-green-400"} />
            <DataField icon={<Plane size={14} />} label="Category" value={AIRCRAFT_CATEGORIES[selectedAircraft.category] || "Unknown"} color="text-indigo-400" />
            <DataField icon={<Clock size={14} />} label="Last Contact" value={selectedAircraft.last_contact ? new Date(selectedAircraft.last_contact * 1000).toLocaleTimeString() : "N/A"} color="text-yellow-400" />
            {selectedAircraft.squawk && (
              <DataField icon={<AlertCircle size={14} />} label="Squawk" value={selectedAircraft.squawk} color="text-orange-400" />
            )}
          </>
        )}

        {!isAircraft && selectedShip && (
          <>
            <DataField icon={<Gauge size={14} />} label="SOG" value={selectedShip.sog !== null ? `${selectedShip.sog.toFixed(1)} kt` : "N/A"} color="text-cyan-400" />
            <DataField icon={<Navigation size={14} />} label="COG" value={selectedShip.cog !== null ? `${selectedShip.cog.toFixed(0)}°` : "N/A"} color="text-blue-400" />
            <DataField icon={<MapPin size={14} />} label="True Heading" value={selectedShip.true_heading !== null ? `${selectedShip.true_heading}°` : "N/A"} color="text-purple-400" />
            <DataField icon={<Radio size={14} />} label="Callsign" value={selectedShip.callsign || "N/A"} color="text-green-400" />
            <DataField icon={<Flag size={14} />} label="IMO" value={selectedShip.imo?.toString() || "N/A"} color="text-indigo-400" />
            <DataField icon={<AlertCircle size={14} />} label="Status" value={NAV_STATUSES[selectedShip.navigational_status ?? 15] || "Undefined"} color="text-yellow-400" />
            <DataField icon={<MapPin size={14} />} label="Position" value={`${selectedShip.latitude.toFixed(4)}, ${selectedShip.longitude.toFixed(4)}`} color="text-pink-400" />
          </>
        )}
      </div>

      {/* Weather Section */}
      {(weather || isLoadingWeather) && (
        <div className="px-4 pb-4">
          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-[var(--border-glass)]">
            <div className="flex items-center gap-2 mb-3">
              <Cloud size={16} className="text-blue-400" />
              <h3 className="text-sm font-bold">Local Weather</h3>
            </div>
            
            {isLoadingWeather ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 skeleton-pulse rounded-lg" />
                ))}
              </div>
            ) : weather ? (
              <>
                <div className="text-3xl font-bold mb-1">{weather.temperature_2m}°C</div>
                <div className="text-xs text-[var(--text-secondary)] mb-3">
                  {weatherCodeToString(weather.weather_code)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-primary)]/50">
                    <Wind size={12} className="text-blue-400" />
                    <span>{weather.wind_speed_10m} km/h</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-primary)]/50">
                    <Navigation size={12} className="text-cyan-400" />
                    <span>{weather.wind_direction_10m}°</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-primary)]/50">
                    <Droplets size={12} className="text-blue-300" />
                    <span>{weather.relative_humidity_2m}%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-primary)]/50">
                    <Gauge size={12} className="text-purple-400" />
                    <span>{weather.pressure_msl} hPa</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">Source: Open-Meteo</p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
