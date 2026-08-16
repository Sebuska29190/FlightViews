"use client";

import { Search, X, Plane, Ship, ExternalLink } from "lucide-react";
import { useStore } from "@/store/useStore";

export function SearchPanel() {
  const { searchQuery, setSearchQuery, aircraft, ships, selectAircraft, selectShip } = useStore();

  const results: Array<{ type: "aircraft" | "ship"; obj: unknown }> = [];
  if (searchQuery.length > 1) {
    const q = searchQuery.toLowerCase();
    const foundAircraft = aircraft.filter((a) =>
      (a.callsign && a.callsign.toLowerCase().includes(q)) ||
      a.icao24.toLowerCase().includes(q) ||
      a.squawk === q
    ).slice(0, 15);

    const foundShips = Array.from(ships.values()).filter((s) =>
      (s.ship_name && s.ship_name.toLowerCase().includes(q)) ||
      s.mmsi.toString().includes(q) ||
      (s.callsign && s.callsign.toLowerCase().includes(q))
    ).slice(0, 15);

    foundAircraft.forEach((a) => results.push({ type: "aircraft" as const, obj: a }));
    foundShips.forEach((s) => results.push({ type: "ship" as const, obj: s }));
  }

  return (
    <div className="p-4 border-b border-[var(--border-glass)]">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search callsign, ICAO, MMSI..."
          className="w-full pl-10 pr-10 py-3 bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
            <X size={16} className="text-[var(--text-tertiary)]" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                if (r.type === "aircraft") selectAircraft(r.obj as any);
                else selectShip(r.obj as any);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] border border-[var(--border-glass)] hover:border-[var(--accent)]/30 transition-all duration-200 hover-lift"
            >
              <div className="flex items-center gap-2.5">
                {r.type === "aircraft" ? (
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Plane size={12} className="text-blue-400" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <Ship size={12} className="text-cyan-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {r.type === "aircraft"
                      ? (r.obj as any).callsign || (r.obj as any).icao24.toUpperCase()
                      : (r.obj as any).ship_name || `MMSI ${(r.obj as any).mmsi}`}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide font-medium">
                    {r.type === "aircraft" ? "Aircraft" : "Vessel"}
                  </div>
                </div>
                <ExternalLink size={12} className="text-[var(--text-tertiary)]" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
