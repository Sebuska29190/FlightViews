"use client";

import { useStore } from "@/store/useStore";
import { Plane, Ship, Activity, Clock } from "lucide-react";

export function StatusBar() {
  const { apiError, isLoadingAircraft, isLoadingShips, aircraft, ships, lastAircraftUpdate } = useStore();
  const shipsCount = ships.size;
  const age = lastAircraftUpdate > 0 ? Math.floor((Date.now() - lastAircraftUpdate) / 1000) : 0;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2" style={{ maxWidth: "320px" }}>
      {apiError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-xs text-red-400 scale-in">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="font-medium">{apiError}</span>
        </div>
      )}
      <div className="flex items-center gap-4 px-4 py-2 rounded-xl glass-panel slide-in">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Plane size={14} className="text-blue-400" />
            {isLoadingAircraft && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-semibold text-sm tabular-nums">{aircraft.length}</span>
        </div>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Ship size={14} className="text-cyan-400" />
            {isLoadingShips && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-semibold text-sm tabular-nums">{shipsCount}</span>
        </div>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <div className="flex items-center gap-1.5">
          <Activity size={12} className={age < 30 ? "text-green-400" : "text-yellow-400"} />
          <span className="text-[11px] tabular-nums text-[var(--text-secondary)]">{age}s</span>
        </div>
      </div>
    </div>
  );
}
