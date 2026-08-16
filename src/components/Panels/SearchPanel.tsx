"use client";

import { Search, X } from "lucide-react";
import { useStore } from "@/store/useStore";

export function SearchPanel() {
  const { searchQuery, setSearchQuery, aircraft, ships, selectAircraft, selectShip } = useStore();

  const results = [];
  if (searchQuery.length > 1) {
    const q = searchQuery.toLowerCase();
    const foundAircraft = aircraft.filter((a) =>
      (a.callsign && a.callsign.toLowerCase().includes(q)) ||
      a.icao24.toLowerCase().includes(q) ||
      a.squawk === q
    ).slice(0, 20);

    const foundShips = Array.from(ships.values()).filter((s) =>
      (s.ship_name && s.ship_name.toLowerCase().includes(q)) ||
      s.mmsi.toString().includes(q) ||
      (s.callsign && s.callsign.toLowerCase().includes(q))
    ).slice(0, 20);

    foundAircraft.forEach((a) => results.push({ type: "aircraft" as const, obj: a }));
    foundShips.forEach((s) => results.push({ type: "ship" as const, obj: s }));
  }

  return (
    <div className="p-4 border-b border-[var(--border-color)]">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search callsign, ICAO24, MMSI, ship name..."
          className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-tertiary)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={16} className="text-[var(--text-tertiary)]" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                if (r.type === "aircraft") selectAircraft(r.obj as any);
                else selectShip(r.obj as any);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${r.type === "aircraft" ? "bg-[var(--accent)]" : "bg-cyan-400"}`} />
                <span className="font-medium">
                  {r.type === "aircraft"
                    ? (r.obj as any).callsign || (r.obj as any).icao24
                    : (r.obj as any).ship_name || `MMSI ${(r.obj as any).mmsi}`}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {r.type === "aircraft" ? "Aircraft" : "Ship"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
