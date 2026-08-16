"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(() => import("@/components/AppShell").then((m) => m.AppShell), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: "#0f172a" }}>
      <div className="h-14 flex items-center px-4" style={{ background: "rgba(30,41,59,0.95)", borderBottom: "1px solid #334155" }}>
        <div className="w-8 h-8 rounded skeleton-pulse" />
        <div className="w-32 h-5 ml-4 rounded skeleton-pulse" />
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">SkySea Tracker</div>
            <div className="text-xs text-gray-400">Loading map...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <AppShell />;
}