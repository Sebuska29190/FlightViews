# SkySea Tracker - API Research (2026-08-17)

## OpenSky Network API

- **Base URL**: `https://opensky-network.org/api`
- **Auth**: OAuth2 Client Credentials ONLY (basic auth removed)
  - Token endpoint: `https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token`
  - Token TTL: 30 min, refresh proactively
- **Endpoints**:
  - `GET /states/all` - all states, supports `lamin/lomin/lamax/lomax` bounding box (WGS84)
  - `GET /tracks/all?icao24=<hex>&time=0` - live track (EXPERIMENTAL, last 30 days max)
- **Credits** (per endpoint bucket: states/tracks/flights):
  - Anonymous: 400/day | Authenticated: 4,000/day | Active feeder: 8,000/day
  - Bounding box ≤ 25 sq° = 1 credit, 25-100 = 2, 100-400 = 3, >400 = 4
- **Key constraints for Vercel**:
  - OpenSky may block AWS IPs (Vercel runs on AWS) → aggressive proxy cache + small bounding boxes
  - CORS → proxy through Next.js API Routes (serverless)
  - Anonymous fallback when rate-limited (less data but works)
- **State vector indices**: 0=icao24, 1=callsign, 2=origin_country, 3=time_position, 4=last_contact, 5=lon, 6=lat, 7=baro_alt, 8=on_ground, 9=velocity, 10=true_track, 11=vertical_rate, 12=sensors, 13=geo_alt, 14=squawk, 15=spi, 16=pos_source, 17=category

## AISStream.io WebSocket

- **URL**: `wss://stream.aisstream.io/v0/stream`
- **Client-side WebSocket** (browsers natively support WSS)
- **Auth**: API key in subscription message, subscribe within 3 seconds
- **Subscription format**:
  ```json
  {
    "APIKey": "<key>",
    "BoundingBoxes": [[[lat1, lon1], [lat2, lon2]]],
    "FiltersShipMMSI": ["123456789"],
    "FilterMessageTypes": ["PositionReport", "ShipStaticData", "StandardClassBPositionReport"]
  }
  ```
- **Subscription updates**: max 1/second (full replace, not merge)
- **Message format**:
  ```json
  {
    "MessageType": "PositionReport",
    "Metadata": { "MMSI": 259000420, "ShipName": "...", "latitude": 66.02, "longitude": 12.25, "time_utc": "..." },
    "Message": {
      "PositionReport": { "Cog": 308, "Latitude": 66.02, "Longitude": 12.25, "Sog": 0, "TrueHeading": 235, "UserID": 259000420, "NavigationalStatus": 15 }
    }
  }
  ```
- **Message types**: PositionReport, ShipStaticData, StandardClassBPositionReport, ExtendedClassBPositionReport, StaticDataReport, LongRangeAisBroadcastMessage, AidsToNavigationReport, SafetyBroadcastMessage
- **Rate limits**: BETA, no SLA, throttle at API key level, max 300 msg/s for global subscription
- **Must handle**: reconnection, re-subscription on bounding box change, message throttling for large views

## Open-Meteo (Free, No Key)

- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Auth**: None (non-commercial)
- **Example**: `?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`
- **Response**: `{ current: { time, temperature_2m, wind_speed_10m, wind_direction_10m, weather_code } }`
- **Rate limits** (free): 600/min, 5,000/hr, 10,000/day, 300,000/month
- **Can call directly from browser (CORS allowed)**

## Vercel Hobby Tier

| Resource | Limit |
|---|---|
| Serverless function duration | 300s (Fluid Compute enabled) |
| Edge function code size | 1 MB gzipped |
| Memory | 2 GB / 1 vCPU |
| Bundle size | 250 MB |
| Fast Data Transfer | 100 GB/month |
| Invocations | 1,000,000/month |
| ISR storage | Unlimited (31-day auto-evict) |
| CDN cache reads | Free (ephemeral) |

**Implications for SkySea Tracker**:
- OpenSky proxy: use `routeSegmentConfig` with `runtime = 'nodejs'`, ISR-style caching with `revalidate = 10`
- Token management: in-memory module-level singleton (cold starts = new token, but cached across warm invocations)
- All heavy lifting client-side to minimize serverless invocations
- Open-Meteo: call directly from client (no proxy needed)

## Architecture Decisions

1. **OpenSky via API Route proxy** (`/api/opensky/states`) - cache 10s per bounding box bucket
2. **OpenSky Token** - module-level cached token with auto-refresh
3. **AISStream via client WebSocket** - use MapContext to manage subscriptions based on map bounds
4. **Open-Meteo direct from client** - no proxy needed
5. **State**: Zustand store for aircraft, ships, favorites, filters
6. **Clustering**: supercluster algorithm, process client-side for performance
7. **Track history**: OpenSky `/tracks` endpoint + client-side accumulation for ships

## Environment Variables

```
OPENSKY_CLIENT_ID=
OPENSKY_CLIENT_SECRET=
AISSTREAM_API_KEY=
NEXT_PUBLIC_AISSTREAM_API_KEY=  (for client-side WebSocket)
```
