import type { MetadataRoute } from "next";

/** Ana ekrana eklenebilen uygulama (PWA) tanımı. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TestMetrix — Test ve madde analizi",
    short_name: "TestMetrix",
    description: "Çoktan seçmeli sınavlar için madde ve test analizi.",
    lang: "tr",
    start_url: "/folders",
    scope: "/",
    display: "standalone",
    theme_color: "#0f1b3d",
    background_color: "#f7f8fb",
    icons: [
      { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
