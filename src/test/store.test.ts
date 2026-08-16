import { describe, it, expect } from "vitest";
import { useStore } from "@/store/useStore";

describe("useStore", () => {
  it("initializes with empty aircraft", () => {
    const state = useStore.getState();
    expect(state.aircraft).toEqual([]);
    expect(state.ships.size).toBe(0);
  });

  it("initializes in dark mode", () => {
    const state = useStore.getState();
    expect(state.darkMode).toBe(true);
  });

  it("sets aircraft", () => {
    const state = useStore.getState();
    state.setAircraft([
      {
        icao24: "abc123",
        callsign: "TEST123",
        origin_country: "Germany",
        time_position: 1000,
        last_contact: 1000,
        longitude: 10.5,
        latitude: 51.5,
        baro_altitude: 10000,
        on_ground: false,
        velocity: 200,
        true_track: 90,
        vertical_rate: 5,
        geo_altitude: 10100,
        squawk: "1234",
        spi: false,
        position_source: 0,
        category: 4,
      },
    ]);
    expect(useStore.getState().aircraft.length).toBe(1);
  });

  it("toggles favorites", () => {
    const state = useStore.getState();
    state.toggleFavorite("abc123");
    expect(useStore.getState().favorites.has("abc123")).toBe(true);

    state.toggleFavorite("abc123");
    expect(useStore.getState().favorites.has("abc123")).toBe(false);
  });

  it("updates ships with track accumulation", () => {
    const state = useStore.getState();
    state.updateShip({
      mmsi: 123456789,
      latitude: 50,
      longitude: 10,
      cog: 90,
      sog: 12,
      true_heading: 85,
      navigational_status: 0,
      ship_name: "TEST SHIP",
      last_update: Date.now(),
      track: [],
    });

    expect(useStore.getState().ships.size).toBe(1);
    const ship = useStore.getState().ships.get(123456789)!;
    expect(ship.ship_name).toBe("TEST SHIP");

    state.updateShip({
      ...ship,
      latitude: 50.01,
      longitude: 10.01,
    });

    const updated = useStore.getState().ships.get(123456789)!;
    expect(updated.track.length).toBe(2);
  });

  it("changes layer mode", () => {
    const state = useStore.getState();
    state.setLayerMode("ships");
    expect(useStore.getState().layerMode).toBe("ships");
  });

  it("sets and resets filters", () => {
    const state = useStore.getState();
    state.setFilters({ min_altitude: 1000, country: "Germany" });
    expect(useStore.getState().filters.min_altitude).toBe(1000);
    expect(useStore.getState().filters.country).toBe("Germany");

    state.resetFilters();
    expect(useStore.getState().filters.min_altitude).toBe(null);
    expect(useStore.getState().filters.country).toBe(null);
  });
});
