"use client";

import { useMemo } from "react";
import { Plane, Ship, TrendingUp } from "lucide-react";
import { useStore } from "@/store/useStore";

export function StatsPanel() {
  const { aircraft, ships, lastAircraftUpdate, lastShipUpdate } = useStore();

  const stats = useMemo(() => {
    if (!aircraft.length && !ships.size) return null;

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
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><TrendingUp size={14} /> Live Stats</h3>
      <div className="space-y-2">
        <StatRow icon={<Plane size={14} />} label="Aircraft Total" value={stats.totalAircraft.toString()} />
        <StatRow icon={<Plane size={14} />} label="In Air" value={stats.airborne.toString()} color="text-green-400" />
        <StatRow icon={<Plane size={14} />} label="On Ground" value={stats.onGround.toString()} color="text-gray-400" />
        <StatRow icon={<span>↑</span>} label="Max Altitude" value={`${(stats.maxAlt * 3.28).toFixed(0)} ft`} />
        <StatRow icon={<span>→</span>} label="Max Speed" value={`${(stats.maxSpeed * 3.6).toFixed(0)} km/h`} />
        <StatRow icon={<span>≈</span>} label="Avg Altitude" value={`${(stats.avgAlt * 3.28).toFixed(0)} ft`} />
        <StatRow icon={<Ship size={14} />} label="Ships Tracked" value={stats.totalShips.toString()} color="text-cyan-400" />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)]/50">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        {icon}
        {label}
      </div>
      <span className={`text-sm font-semibold ${color || ""}`}>{value}</span>
    </div>
  );
}
