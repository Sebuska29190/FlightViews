import { create } from "zustand";
import type { Aircraft, Ship, Filters, LayerMode, BoundingBox } from "@/lib/types";

interface AppState {
  aircraft: Aircraft[];
  ships: Map<number, Ship>;
  selectedAircraft: Aircraft | null;
  selectedShip: Ship | null;
  layerMode: LayerMode;
  darkMode: boolean;
  filters: Filters;
  searchQuery: string;
  favorites: Set<string>;
  mapBounds: BoundingBox | null;
  isLoadingAircraft: boolean;
  isLoadingShips: boolean;
  lastAircraftUpdate: number;
  lastShipUpdate: number;
  apiError: string | null;
  sidebarOpen: boolean;
  trackIcao: string | null;
  trackPath: [number, number][];

  setAircraft: (a: Aircraft[]) => void;
  updateShip: (ship: Ship) => void;
  setShips: (ships: Ship[]) => void;
  selectAircraft: (a: Aircraft | null) => void;
  selectShip: (s: Ship | null) => void;
  setLayerMode: (m: LayerMode) => void;
  toggleDarkMode: () => void;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
  setSearchQuery: (q: string) => void;
  toggleFavorite: (id: string) => void;
  setMapBounds: (b: BoundingBox | null) => void;
  setLoadingAircraft: (v: boolean) => void;
  setLoadingShips: (v: boolean) => void;
  setApiError: (e: string | null) => void;
  toggleSidebar: () => void;
  setTrack: (icao: string | null, path: [number, number][]) => void;
}

const defaultFilters: Filters = {
  min_altitude: null,
  max_altitude: null,
  min_speed: null,
  max_speed: null,
  country: null,
  on_ground_only: false,
  airborne_only: false,
  ship_type: null,
};

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const stored = localStorage.getItem("sksea-favorites");
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function loadDarkMode(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("sksea-darkmode");
  return stored !== null ? JSON.parse(stored) : true;
}

export const useStore = create<AppState>((set) => ({
  aircraft: [],
  ships: new Map(),
  selectedAircraft: null,
  selectedShip: null,
  layerMode: "all",
  darkMode: loadDarkMode(),
  filters: defaultFilters,
  searchQuery: "",
  favorites: loadFavorites(),
  mapBounds: null,
  isLoadingAircraft: true,
  isLoadingShips: true,
  lastAircraftUpdate: 0,
  lastShipUpdate: 0,
  apiError: null,
  sidebarOpen: false,
  trackIcao: null,
  trackPath: [],

  setAircraft: (a) =>
    set({ aircraft: a, lastAircraftUpdate: Date.now(), isLoadingAircraft: false }),
  updateShip: (ship) =>
    set((state) => {
      const newShips = new Map(state.ships);
      const existing = newShips.get(ship.mmsi);
      const track = existing
        ? [...existing.track, [ship.latitude, ship.longitude] as [number, number]].slice(-120)
        : [[ship.latitude, ship.longitude] as [number, number]];
      newShips.set(ship.mmsi, { ...ship, track });
      return { ships: newShips, lastShipUpdate: Date.now(), isLoadingShips: false };
    }),
  setShips: (ships) =>
    set(() => {
      const map = new Map<number, Ship>();
      ships.forEach((s) => map.set(s.mmsi, s));
      return { ships: map, isLoadingShips: false };
    }),
  selectAircraft: (a) => set({ selectedAircraft: a, selectedShip: null }),
  selectShip: (s) => set({ selectedShip: s, selectedAircraft: null }),
  setLayerMode: (m) => set({ layerMode: m }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof window !== "undefined") localStorage.setItem("sksea-darkmode", JSON.stringify(next));
      return { darkMode: next };
    }),
  setFilters: (f) =>
    set((state) => ({ filters: { ...state.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleFavorite: (id) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== "undefined")
        localStorage.setItem("sksea-favorites", JSON.stringify([...next]));
      return { favorites: next };
    }),
  setMapBounds: (b) => set({ mapBounds: b }),
  setLoadingAircraft: (v) => set({ isLoadingAircraft: v }),
  setLoadingShips: (v) => set({ isLoadingShips: v }),
  setApiError: (e) => set({ apiError: e }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTrack: (icao, path) => set({ trackIcao: icao, trackPath: path }),
}));
