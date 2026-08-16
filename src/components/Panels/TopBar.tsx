"use client";

import { useStore } from "@/store/useStore";
import { 
  Plane, Ship, Layers, Menu, Sun, Moon, Star, 
  Search, ChevronLeft, ChevronRight 
} from "lucide-react";

export function TopBar() {
  const { 
    layerMode, setLayerMode, darkMode, toggleDarkMode, 
    sidebarOpen, toggleSidebar, favorites, aircraft, ships 
  } = useStore();

  const layerButtons: { mode: typeof layerMode; icon: React.ReactNode; label: string; count: number }[] = [
    { mode: "all", icon: <Layers size={14} />, label: "All", count: aircraft.length + ships.size },
    { mode: "aircraft", icon: <Plane size={14} />, label: "Aircraft", count: aircraft.length },
    { mode: "ships", icon: <Ship size={14} />, label: "Ships", count: ships.size },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-[1001] flex items-center gap-3 px-4 py-3 glass-panel border-b border-[var(--border-glass)]">
      <button 
        onClick={toggleSidebar}
        className="p-2 rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all duration-200 relative"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex flex-col">
        <h1 className="text-lg font-bold tracking-tight leading-tight">
          Sky<span className="text-[var(--accent)]">Sea</span>
        </h1>
        <p className="text-[10px] text-[var(--text-tertiary)] -mt-0.5 font-medium">Live Tracker</p>
      </div>

      <div className="flex items-center gap-1 ml-3 p-1 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)]">
        {layerButtons.map(({ mode, icon, label, count }) => (
          <button 
            key={mode}
            onClick={() => setLayerMode(mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              layerMode === mode
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]"
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            {count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                layerMode === mode ? "bg-white/20" : "bg-[var(--bg-tertiary)]"
              }`}>
                {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {favorites.size > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            <Star size={13} className="fill-current" />
            <span>{favorites.size}</span>
          </div>
        )}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-[var(--bg-glass-hover)] transition-all duration-200"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
