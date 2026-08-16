"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Star, MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatSpeed, formatAltitude, formatHeading, fetchWeather, weatherCodeToString } from "@/lib/utils";
import type { WeatherData } from "@/lib/types";

export function DetailPanel() {
  const { selectedAircraft, selectedShip, selectAircraft, selectShip, favorites, toggleFavorite, setTrack } = useStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    if (selectedAircraft) {
      fetchWeather(selectedAircraft.latitude!, selectedAircraft.longitude!).then(setWeather);
    } else if (selectedShip) {
      fetchWeather(selectedShip.latitude, selectedShip.longitude).then(setWeather);
    }
  }, [selectedAircraft, selectedShip]);

  const handleLoadTrack = async () => {
    if (!selectedAircraft) return;
    setTrackLoading(true);
    try {
      const res = await fetch(`/api/opensky/track?icao24=${selectedAircraft.icao24}`);
      if (res.ok) {
        const data = await res.json();
        if (data.path && data.path.length > 0) {
          setTrack(selectedAircraft.icao24, data.path.map((p: number[]) => [p[1], p[2]]));
        }
      }
    } catch {
      // silent
    }
    setTrackLoading(false);
  };

  const handleClose = () => {
    selectAircraft(null);
    selectShip(null);
    setWeather(null);
    setTrack(null, []);
  };

  if (!selectedAircraft && !selectedShip) return null;

  const obj = selectedAircraft || selectedShip!;
  const isAircraft = !!selectedAircraft;
  const id = isAircraft ? selectedAircraft!.icao24 : `mmsi-${selectedShip!.mmsi}`;
  const isFav = favorites.has(id);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            {isAircraft ? selectedAircraft!.callsign || selectedAircraft!.icao24 : selectedShip!.ship_name || `MMSI ${selectedShip!.mmsi}`}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isAircraft ? `${selectedAircraft!.icao24} • ${selectedAircraft!.origin_country}` : `MMSI ${selectedShip!.mmsi}`}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => toggleFavorite(id)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
            <Star size={18} className={isFav ? "fill-[var(--warning)] text-[var(--warning)]" : ""} />
          </button>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isAircraft ? (
          <>
            <InfoRow label="Altitude" value={formatAltitude(selectedAircraft!?.baro_altitude)} />
            <InfoRow label="Speed" value={formatSpeed(selectedAircraft!?.velocity)} />
            <InfoRow label="Heading" value={formatHeading(selectedAircraft!?.true_track)} />
            <InfoRow label="Vertical Rate" value={selectedAircraft!?.vertical_rate ? `${selectedAircraft.vertical_rate.toFixed(1)} m/s` : "N/A"} />
            <InfoRow label="On Ground" value={selectedAircraft!?.on_ground ? "Yes" : "No"} />
            <InfoRow label="Category" value={String([0,'No Info',2,'Light',3,'Small',4,'Large',5,'High Vortex',6,'Heavy',7,'High Perf',8,'Rotorcraft'][selectedAircraft!.category] || "Unknown")} />
            <InfoRow label="Position Source" value={String(['ADS-B','ASTERIX','MLAT','FLARM'][selectedAircraft!.position_source || 0])} />
            <InfoRow label="Last Contact" value={selectedAircraft!.last_contact ? new Date(selectedAircraft.last_contact * 1000).toLocaleTimeString() : "N/A"} />
          </>
        ) : (
          <>
            <InfoRow label="MMSI" value={selectedShip!.mmsi.toString()} />
            <InfoRow label="Callsign" value={selectedShip!.callsign || "N/A"} />
            <InfoRow label="IMO" value={selectedShip!.imo?.toString() || "N/A"} />
            <InfoRow label="Ship Type" value={String([0,'Unknown',20,'WIG',30,'Fishing',40,'HSC',50,'Pilot/SAR/Tug',60,'Passenger',70,'Cargo',80,'Tanker',90,'Other'][Math.floor((selectedShip!.ship_type || 0) / 10) * 10] || "Unknown")} />
            <InfoRow label="COG" value={selectedShip!?.cog !== null && selectedShip!?.cog !== undefined ? `${selectedShip!.cog}°` : "N/A"} />
            <InfoRow label="SOG" value={selectedShip!?.sog !== null && selectedShip!?.sog !== undefined ? `${selectedShip!.sog.toFixed(1)} kt` : "N/A"} />
            <InfoRow label="Heading" value={selectedShip!?.true_heading !== null && selectedShip!?.true_heading !== undefined ? `${selectedShip!.true_heading}°` : "N/A"} />
            <InfoRow label="Position" value={`${selectedShip!.latitude.toFixed(4)}, ${selectedShip!.longitude.toFixed(4)}`} />
          </>
        )}
      </div>

      {isAircraft && (
        <div className="flex gap-2">
          <button onClick={handleLoadTrack} disabled={trackLoading} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent)] text-white rounded-lg text-sm disabled:opacity-50">
            <MapPin size={14} /> {trackLoading ? "Loading..." : "Track History"}
          </button>
          <a href={`https://www.flightradar24.com/${selectedAircraft!.icao24}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg text-sm hover:bg-[var(--bg-secondary)]">
            <ExternalLink size={14} /> FR24
          </a>
        </div>
      )}

      {weather && (
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
          <h3 className="text-sm font-semibold mb-2">Local Weather</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Temp: {weather.temperature_2m}°C</div>
            <div>Wind: {weather.wind_speed_10m} km/h @ {weather.wind_direction_10m}°</div>
            <div>Humidity: {weather.relative_humidity_2m}%</div>
            <div>Pressure: {weather.pressure_msl} hPa</div>
            <div className="col-span-2">Conditions: {weatherCodeToString(weather.weather_code)}</div>
            <div className="text-[var(--text-tertiary)] mt-1">{weather.time}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
