import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LearnNest - Gamified Learning for Kids",
    short_name: "LearnNest",
    description: "A fun, gamified learning platform for children",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9333EA",
    orientation: "portrait-primary",
    categories: ["education", "kids", "games"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
