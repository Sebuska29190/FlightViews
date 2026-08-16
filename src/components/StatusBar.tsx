"use client";

import { useStore } from "@/store/useStore";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";

export function StatusBar() {
  const { apiError, isLoadingAircraft, isLoadingShips, aircraft, ships, lastAircraftUpdate } = useStore();
  const shipsCount = ships.size;
  const age = lastAircraftUpdate > 0 ? Math.floor((Date.now() - lastAircraftUpdate) / 1000) : 0;

  return (
    <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5" style={{ maxWidth: "280px" }}>
      {apiError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
             style={{ background: "rgba(239, 68, 68, 0.9)", color: "white" }}>
          <AlertTriangle size={14} />
          <span className="truncate">{apiError}</span>
        </div>
      )}
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs"
           style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-1.5">
          {isLoadingAircraft ? (
            <Loader2 size={12} className="animate-spin text-blue-400" />
          ) : (
            <Wifi size={12} className="text-green-400" />
          )}
          <span>{aircraft.length}</span>
          <span className="text-[var(--text-tertiary)]">✈</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className={shipsCount > 0 ? "text-cyan-400" : "text-gray-400"} />
          <span>{shipsCount}</span>
          <span className="text-[var(--text-tertiary)]">🚢</span>
        </div>
        {age > 0 && (
          <span className="text-[var(--text-tertiary)]">{age}s ago</span>
        )}
      </div>
    </div>
  );
}
