# Changelog

## [0.1.0] - 2026-08-17

### Added
- Initial release
- Real-time aircraft tracking via OpenSky Network
- Real-time ship tracking via AISStream WebSocket
- Interactive Leaflet map with dark/light tile layers
- Layer switcher (Aircraft / Ships / All)
- Dark mode + Light mode with persistence
- Bounding-box based API calls (credit efficient)
- Aircraft & ship detail panels
- Live weather data via Open-Meteo
- Track history for aircraft (polyline on map)
- Global search (callsign, ICAO24, MMSI, ship name, squawk)
- Advanced filters (altitude, speed, country, airborne/ground)
- Favorites with localStorage persistence
- Live statistics panel
- Auto-refresh (15s interval with debouncing)
- Responsive design (mobile-first)
- PWA manifest
- Next.js API route proxy with OAuth2 token management
- Graceful degradation when API keys are missing

### Planned (Future)
- [ ] Ship track history (client-side polyline)
- [ ] Browser Notification API for favorite objects entering view
- [ ] Supercluster library for dense marker areas
- [ ] Unit tests and E2E tests
- [ ] Keyboard shortcuts
- [ ] Share object view via URL
- [ ] Heatmap visualization mode
- [ ] Historical data playback
