"use client";

import { useStore } from "@/store/useStore";
import { Plane, Ship, Layers, Menu, Search, Sun, Moon, Star } from "lucide-react";

export function TopBar() {
  const { layerMode, setLayerMode, darkMode, toggleDarkMode, sidebarOpen, toggleSidebar, favorites } = useStore();

  const layerButtons: { mode: typeof layerMode; icon: React.ReactNode; label: string }[] = [
    { mode: "all", icon: <Layers size={16} />, label: "All" },
    { mode: "aircraft", icon: <Plane size={16} />, label: "Aircraft" },
    { mode: "ships", icon: <Ship size={16} />, label: "Ships" },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-[1001] h-14 flex items-center gap-2 px-3"
            style={{ background: "var(--panel-bg)", borderBottom: "1px solid var(--border-color)" }}>
      <button onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Toggle sidebar">
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold tracking-tight hidden sm:block">
        Sky<span className="text-[var(--accent)]">Sea</span>
      </h1>

      <div className="flex items-center gap-1 ml-2 sm:ml-4 bg-[var(--bg-tertiary)] p-1 rounded-lg">
        {layerButtons.map(({ mode, icon, label }) => (
          <button key={mode}
                  onClick={() => setLayerMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    layerMode === mode
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}>
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label="Toggle theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {favorites.size > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-xs">
            <Star size={14} className="text-[var(--warning)]" />
            <span>{favorites.size}</span>
          </div>
        )}
      </div>
    </header>
  );
}
