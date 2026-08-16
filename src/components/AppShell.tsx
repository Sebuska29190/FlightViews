"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import { MapView } from "@/components/Map/MapView";
import { TopBar } from "@/components/Panels/TopBar";
import { DetailPanel } from "@/components/Panels/DetailPanel";
import { FilterPanel } from "@/components/Panels/FilterPanel";
import { StatsPanel } from "@/components/Panels/StatsPanel";
import { SearchPanel } from "@/components/Panels/SearchPanel";
import { StatusBar } from "@/components/StatusBar";
import { AircraftFetcher } from "@/hooks/useAircraftFetcher";
import { AISConnector } from "@/hooks/useAISConnector";
import { FavoriteNotifier } from "@/components/FavoriteNotifier";

export function AppShell() {
  const { darkMode, sidebarOpen, selectedAircraft, selectedShip } = useStore();

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

      <div className="absolute inset-0 top-[56px]">
        <MapView />
      </div>

      <StatusBar />

      {/* Sidebar - Desktop */}
      <div
        className={`absolute top-[56px] left-0 bottom-0 z-[1000] w-[340px] overflow-y-auto scrollbar-thin transition-transform duration-300 ease-out glass-panel border-r border-[var(--border-glass)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SearchPanel />
        <FilterPanel />
        <StatsPanel />
      </div>

      {/* Detail Panel - Desktop */}
      <div
        className={`absolute top-[56px] right-0 bottom-0 z-[1000] w-[380px] overflow-y-auto scrollbar-thin transition-transform duration-300 ease-out glass-panel border-l border-[var(--border-glass)] ${
          hasSelection ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {hasSelection && <DetailPanel />}
      </div>
    </div>
  );
}
