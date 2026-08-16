"use client";

import { useMemo } from "react";
import { Plane, Ship, TrendingUp, Activity, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";

export function StatsPanel() {
  const { aircraft, ships, lastAircraftUpdate, lastShipUpdate } = useStore();

  const stats = useMemo(() => {
    if (!aircraft.length && ships.size === 0) return null;

    const airborne = aircraft.filter((a) => !a.on_ground);
    const maxAlt = Math.max(...aircraft.map((a) => a.baro_altitude || 0));
    const maxSpeed = Math.max(...aircraft.map((a) => a.velocity || 0));
    const avgAlt = airborne.length > 0
      ? airborne.reduce((sum, a) => sum + (a.baro_altitude || 0), 0) / airborne.length
      : 0;

    return {
      totalAircraft: aircraft.length,
      airborne: airborne.length,
      onGround: aircraft.length - airborne.length,
      maxAlt,
      maxSpeed,
      avgAlt,
      totalShips: ships.size,
      lastAircraft: Math.floor((Date.now() - lastAircraftUpdate) / 1000),
      lastShip: Math.floor((Date.now() - lastShipUpdate) / 1000),
    };
  }, [aircraft, ships, lastAircraftUpdate, lastShipUpdate]);

  if (!stats) return null;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[var(--accent)]/20">
          <Activity size={14} className="text-[var(--accent)]" />
        </div>
        <h3 className="text-sm font-semibold">Live Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard 
          icon={<Plane size={14} />}
          label="Aircraft"
          value={stats.totalAircraft}
          color="blue"
        />
        <StatCard 
          icon={<Plane size={14} className="rotate-45" />}
          label="In Flight"
          value={stats.airborne}
          color="green"
        />
        <StatCard 
          icon={<Plane size={14} className="rotate-180" />}
          label="On Ground"
          value={stats.onGround}
          color="gray"
        />
        <StatCard 
          icon={<Ship size={14} />}
          label="Vessels"
          value={stats.totalShips}
          color="cyan"
        />
        <StatCard 
          icon={<TrendingUp size={14} />}
          label="Max Alt"
          value={`${(stats.maxAlt * 3.28 / 1000).toFixed(1)}k`}
          suffix="ft"
          color="purple"
        />
        <StatCard 
          icon={<Zap size={14} />}
          label="Max Speed"
          value={Math.round(stats.maxSpeed * 1.94384)}
          suffix="kt"
          color="orange"
        />
      </div>

      {(stats.lastAircraft > 0 || stats.lastShip > 0) && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)] text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${stats.lastAircraft < 30 ? "bg-green-400" : "bg-yellow-400"}`} />
            <span className="tabular-nums">Updated {stats.lastAircraft}s ago</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, suffix, color }: { 
  icon: React.ReactNode; label: string; value: number | string; suffix?: string; color: string 
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    gray: "bg-gray-500/20 text-gray-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-glass)] hover:border-[var(--accent)]/30 transition-all duration-200 hover-lift">
      <div className={`inline-flex p-1.5 rounded-lg ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && <span className="text-xs text-[var(--text-tertiary)] ml-1">{suffix}</span>}
      </div>
      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mt-0.5">
        {label}
      </div>
    </div>
  );
}
