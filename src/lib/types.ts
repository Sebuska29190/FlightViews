export interface Aircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
  category: number;
}

export interface Ship {
  mmsi: number;
  latitude: number;
  longitude: number;
  cog: number | null;
  sog: number | null;
  true_heading: number | null;
  navigational_status: number | null;
  ship_name?: string;
  ship_type?: number;
  callsign?: string;
  imo?: number;
  last_update: number;
  track: [number, number][];
}

export interface WeatherData {
  time: string;
  temperature_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
  relative_humidity_2m?: number;
  pressure_msl?: number;
  cloud_cover?: number;
}

export type LayerMode = "all" | "aircraft" | "ships";

export interface Filters {
  min_altitude: number | null;
  max_altitude: number | null;
  min_speed: number | null;
  max_speed: number | null;
  country: string | null;
  on_ground_only: boolean;
  airborne_only: boolean;
  ship_type: number | null;
}

export interface BoundingBox {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export interface TrackPoint {
  time: number;
  latitude: number;
  longitude: number;
  baro_altitude: number | null;
  true_track: number | null;
  on_ground: boolean;
}

export interface TrackData {
  icao24: string;
  startTime: number;
  endTime: number;
  callsign: string | null;
  path: TrackPoint[];
}
