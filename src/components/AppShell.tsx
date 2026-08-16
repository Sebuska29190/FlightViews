"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { MapView } from "@/components/Map/MapView";
import { TopBar } from "@/components/Panels/TopBar";
import { DetailPanel } from "@/components/Panels/DetailPanel";
import { FilterPanel } from "@/components/Panels/FilterPanel";
import { StatsPanel } from "@/components/Panels/StatsPanel";
import { SearchPanel } from "@/components/Panels/SearchPanel";
import { AircraftFetcher } from "@/hooks/useAircraftFetcher";
import { AISConnector } from "@/hooks/useAISConnector";
import { FavoriteNotifier } from "@/components/FavoriteNotifier";

export function AppShell() {
  const darkMode = useStore((s) => s.darkMode);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const selectedAircraft = useStore((s) => s.selectedAircraft);
  const selectedShip = useStore((s) => s.selectedShip);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const hasSelection = selectedAircraft !== null || selectedShip !== null;

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <AircraftFetcher />
      <AISConnector />
      <FavoriteNotifier />
      <TopBar />
      <div className="absolute inset-0 top-14">
        <MapView />
      </div>

      {sidebarOpen && (
        <div className="absolute top-14 left-0 bottom-0 z-[1000] w-80 max-w-[90vw] overflow-y-auto scrollbar-thin"
             style={{ background: "var(--panel-bg)" }}>
          <SearchPanel />
          <FilterPanel />
          <StatsPanel />
        </div>
      )}

      {hasSelection && (
        <div className="absolute top-14 right-0 bottom-0 z-[1000] w-96 max-w-[95vw] overflow-y-auto scrollbar-thin"
             style={{ background: "var(--panel-bg)" }}>
          <DetailPanel />
        </div>
      )}
    </div>
  );
}
