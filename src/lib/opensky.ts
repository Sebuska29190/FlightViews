const OPENSKY_TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

interface TokenData {
  access_token: string;
  expires_at: number;
}

let cachedToken: TokenData | null = null;
let tokenFailed = false;
let workingProxy: string | null = null;

async function tryFetch(url: string, options: RequestInit, withProxy = false): Promise<Response | null> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(timeout);
    return res;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchWithProxy(url: string, options: RequestInit): Promise<Response | null> {
  if (workingProxy) {
    const res = await tryFetch(`${workingProxy}${encodeURIComponent(url)}`, options);
    if (res && res.ok) return res;
    workingProxy = null;
  }

  const res = await tryFetch(url, options);
  if (res) return res;

  for (const proxy of CORS_PROXIES) {
    const proxyRes = await tryFetch(`${proxy}${encodeURIComponent(url)}`, options);
    if (proxyRes && proxyRes.ok) {
      workingProxy = proxy;
      return proxyRes;
    }
  }

  return null;
}

export async function getOpenSkyToken(): Promise<string | null> {
  if (tokenFailed) return null;

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const res = await fetchWithProxy(OPENSKY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!res || !res.ok) {
    console.error("[OpenSky Token] Failed:", res?.status);
    tokenFailed = true;
    return null;
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 1800) * 1000,
  };
  return cachedToken.access_token;
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

function parseStateVectors(raw: unknown[][]): OpenSkyStateVector[] {
  return raw
    .filter(
      (s) =>
        s[5] !== null &&
        s[6] !== null &&
        s[5] !== undefined &&
        s[6] !== undefined
    )
    .map((s) => ({
      icao24: s[0] as string,
      callsign: s[1] ? (s[1] as string).trim() : null,
      origin_country: s[2] as string,
      time_position: s[3] as number | null,
      last_contact: s[4] as number,
      longitude: s[5] as number,
      latitude: s[6] as number,
      baro_altitude: s[7] as number | null,
      on_ground: Boolean(s[8]),
      velocity: s[9] as number | null,
      true_track: s[10] as number | null,
      vertical_rate: s[11] as number | null,
      geo_altitude: s[13] as number | null,
      squawk: s[14] as string | null,
      spi: Boolean(s[15]),
      position_source: s[16] as number,
      category: (s[17] as number) || 0,
    }));
}

export async function fetchStates(
  lamin: number,
  lomin: number,
  lamax: number,
  lomax: number
): Promise<OpenSkyStateVector[] | null> {
  const params = new URLSearchParams({
    lamin: lamin.toFixed(4),
    lomin: lomin.toFixed(4),
    lamax: lamax.toFixed(4),
    lomax: lomax.toFixed(4),
  });

  const url = `https://opensky-network.org/api/states/all?${params}`;

  const token = await getOpenSkyToken();
  const tries: { headers: Record<string, string>; mode: string }[] = [];

  if (token) {
    tries.push({ headers: { Authorization: `Bearer ${token}` }, mode: "auth" });
  }
  tries.push({ headers: {}, mode: "anonymous" });

  for (const { headers, mode } of tries) {
    const res = await fetchWithProxy(url, { headers, next: { revalidate: 10 } });

    if (!res) {
      console.error(`[OpenSky ${mode}] Connection failed (timeout or network error)`);
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      console.log(`[OpenSky ${mode}${workingProxy ? "+proxy" : ""}] OK: ${data.states?.length || 0} states`);
      return data.states ? parseStateVectors(data.states) : [];
    }

    if (res.status === 429) {
      console.warn(`[OpenSky ${mode}] Rate limited (429)`);
      return null;
    }

    console.warn(`[OpenSky ${mode}] Failed: ${res.status} ${res.statusText}`);
  }

  return null;
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
