import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// base must match the GitHub repo name for GitHub Pages project sites.
// If you ever move to a custom domain or a *.pages.dev address, change base to "/".
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // start_url and scope are derived from `base`, so they stay correct on Pages.
      // The icons are already picked up by globPatterns below; letting the plugin
      // add them again would just list every icon in the precache twice.
      includeManifestIcons: false,
      manifest: {
        name: "Nana Knows",
        short_name: "Nana Knows",
        description:
          "Free sizing, yardage, and gauge advice for knitters and crocheters, from Nana Purl herself.",
        theme_color: "#FBF6EC",
        background_color: "#FBF6EC",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the app shell only. No runtime caching, no network chatter.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        // og-image is only ever fetched by link-preview scrapers, so there is no
        // reason to push 70KB of it into every visitor's offline cache.
        globIgnores: ["og-image.png"],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
      // Serve the manifest and a real service worker in `npm run dev` too,
      // so what we test locally matches what ships.
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  base: "/nana-knows/",
});
