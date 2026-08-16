"use client";

import { useStore } from "@/store/useStore";
import { Filter, X } from "lucide-react";

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useStore();

  const Input = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 bg-[var(--bg-tertiary)] rounded text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
      />
    </div>
  );

  return (
    <div className="p-4 border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Filter size={14} /> Filters</h3>
        <button onClick={resetFilters} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1">
          <X size={12} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Input
          label="Min Alt (m)"
          value={filters.min_altitude?.toString() || ""}
          onChange={(v) => setFilters({ min_altitude: v ? parseInt(v) : null })}
          placeholder="0"
        />
        <Input
          label="Max Alt (m)"
          value={filters.max_altitude?.toString() || ""}
          onChange={(v) => setFilters({ max_altitude: v ? parseInt(v) : null })}
          placeholder="15000"
        />
        <Input
          label="Min Speed (m/s)"
          value={filters.min_speed?.toString() || ""}
          onChange={(v) => setFilters({ min_speed: v ? parseInt(v) : null })}
          placeholder="0"
        />
        <Input
          label="Country"
          value={filters.country || ""}
          onChange={(v) => setFilters({ country: v || null })}
          placeholder="Germany"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilters({ airborne_only: !filters.airborne_only, on_ground_only: false })}
          className={`px-3 py-1.5 rounded text-xs ${filters.airborne_only ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-tertiary)]"}`}
        >
          Airborne Only
        </button>
        <button
          onClick={() => setFilters({ on_ground_only: !filters.on_ground_only, airborne_only: false })}
          className={`px-3 py-1.5 rounded text-xs ${filters.on_ground_only ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-tertiary)]"}`}
        >
          On Ground
        </button>
      </div>
    </div>
  );
}
