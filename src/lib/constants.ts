export const OPENSKY_STATES_URL = "https://opensky-network.org/api/states/all";
export const OPENSKY_TRACKS_URL = "https://opensky-network.org/api/tracks/all";
export const OPENSKY_TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

export const OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast";
export const AISSTREAM_WS_URL = "wss://stream.aisstream.io/v0/stream";

export const MAP_DEFAULT_CENTER: [number, number] = [51.5074, -0.1278];
export const MAP_DEFAULT_ZOOM = 5;

export const REFRESH_INTERVAL = 15000;
export const BOUNDING_BOX_DEBOUNCE = 800;
export const CLUSTER_THRESHOLD = 300;

export const AIRCRAFT_CATEGORY: Record<number, string> = {
  0: "Unknown",
  1: "No Info",
  2: "Light",
  3: "Small",
  4: "Large",
  5: "High Vortex Large",
  6: "Heavy",
  7: "High Performance",
  8: "Rotorcraft",
  9: "Glider",
  10: "Lighter-than-air",
  11: "Parachutist",
  12: "Ultralight",
  14: "UAV",
  15: "Space",
  16: "Emergency Vehicle",
  17: "Service Vehicle",
  18: "Point Obstacle",
};

export const SHIP_TYPES: Record<number, string> = {
  0: "Not Available",
  20: "Wing in Ground",
  30: "Fishing",
  31: "Towing",
  32: "Towing Large",
  33: "Dredging",
  34: "Diving Ops",
  35: "Military Ops",
  36: "Sailing",
  37: "Pleasure Craft",
  40: "High Speed Craft",
  50: "Pilot Vessel",
  51: "SAR",
  52: "Tug",
  53: "Port Tender",
  55: "Law Enforcement",
  58: "Medical Transport",
  60: "Passenger",
  70: "Cargo",
  80: "Tanker",
  90: "Other",
};

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight shower",
  81: "Moderate shower",
  82: "Violent shower",
  95: "Thunderstorm",
  96: "Thunderstorm w/ hail",
  99: "Severe thunderstorm",
};
