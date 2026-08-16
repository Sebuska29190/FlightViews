const OPENSKY_TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

interface TokenData {
  access_token: string;
  expires_at: number;
}

let cachedToken: TokenData | null = null;

export async function getOpenSkyToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  try {
    const res = await fetch(OPENSKY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in || 1800) * 1000,
    };
    return cachedToken.access_token;
  } catch {
    return null;
  }
}

export interface OpenSkyStateVector {
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

function parseStateVectors(raw: number[][]): OpenSkyStateVector[] {
  return raw
    .filter(
      (s) =>
        s[5] !== null &&
        s[6] !== null &&
        s[5] !== undefined &&
        s[6] !== undefined
    )
    .map((s) => ({
      icao24: s[0],
      callsign: s[1] ? s[1].trim() : null,
      origin_country: s[2],
      time_position: s[3],
      last_contact: s[4],
      longitude: s[5],
      latitude: s[6],
      baro_altitude: s[7],
      on_ground: s[8],
      velocity: s[9],
      true_track: s[10],
      vertical_rate: s[11],
      geo_altitude: s[13],
      squawk: s[14],
      spi: s[15],
      position_source: s[16],
      category: s[17] || 0,
    }));
}

export async function fetchStates(
  lamin: number,
  lomin: number,
  lamax: number,
  lomax: number
): Promise<OpenSkyStateVector[] | null> {
  const token = await getOpenSkyToken();
  const params = new URLSearchParams({
    lamin: lamin.toString(),
    lomin: lomin.toString(),
    lamax: lamax.toString(),
    lomax: lomax.toString(),
  });

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?${params}`,
      { headers, next: { revalidate: 10 } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.states ? parseStateVectors(data.states) : [];
  } catch {
    return null;
  }
}

export async function fetchTrack(
  icao24: string
): Promise<{ path: number[][] } | null> {
  const token = await getOpenSkyToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`,
      { headers }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
