"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Filter, X, ChevronDown, Plane, TrendingUp } from "lucide-react";

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasFilters = 
    filters.min_altitude !== null || filters.max_altitude !== null ||
    filters.min_speed !== null || filters.country !== null ||
    filters.airborne_only || filters.on_ground_only;

  const Input = ({ label, value, onChange, placeholder, icon }: { 
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode 
  }) => (
    <div>
      <label className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold block mb-1.5 flex items-center gap-1">
        {icon}{label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200"
      />
    </div>
  );

  return (
    <div className="border-b border-[var(--border-glass)]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-glass-hover)] transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent)]/20">
            <Filter size={14} className="text-[var(--accent)]" />
          </div>
          <span className="text-sm font-semibold">Filters</span>
          {hasFilters && (
            <div className="px-1.5 py-0.5 rounded-md bg-[var(--accent)]/20 text-[10px] font-bold text-[var(--accent)]">
              Active
            </div>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Alt"
              value={filters.min_altitude?.toString() || ""}
              onChange={(v) => setFilters({ min_altitude: v ? parseInt(v) : null })}
              placeholder="0"
              icon={<TrendingUp size={10} />}
            />
            <Input
              label="Max Alt"
              value={filters.max_altitude?.toString() || ""}
              onChange={(v) => setFilters({ max_altitude: v ? parseInt(v) : null })}
              placeholder="15000"
              icon={<TrendingUp size={10} />}
            />
          </div>
          
          <Input
            label="Country"
            value={filters.country || ""}
            onChange={(v) => setFilters({ country: v || null })}
            placeholder="e.g., Germany"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilters({ airborne_only: !filters.airborne_only, on_ground_only: false })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                filters.airborne_only 
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]" 
                  : "bg-[var(--bg-tertiary)]/50 border-[var(--border-glass)] hover:border-[var(--accent)]/30"
              }`}
            >
              <Plane size={12} className={filters.airborne_only ? "" : "text-green-400"} />
              Airborne
            </button>
            <button
              onClick={() => setFilters({ on_ground_only: !filters.on_ground_only, airborne_only: false })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                filters.on_ground_only 
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]" 
                  : "bg-[var(--bg-tertiary)]/50 border-[var(--border-glass)] hover:border-[var(--accent)]/30"
              }`}
            >
              <Plane size={12} className={`${filters.on_ground_only ? "" : "text-gray-400"} rotate-180`} />
              Ground
            </button>
          </div>

          {hasFilters && (
            <button 
              onClick={resetFilters} 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 border border-red-500/20 transition-colors duration-200"
            >
              <X size={14} />
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
