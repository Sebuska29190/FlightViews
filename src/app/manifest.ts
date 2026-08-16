import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkySea Tracker",
    short_name: "SkySea",
    description: "Global real-time aircraft and ship tracking",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
