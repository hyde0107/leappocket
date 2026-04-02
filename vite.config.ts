import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "LEAP - 本気の英単語アプリ",
        short_name: "LEAP",
        description: "本気で覚えるための高効率・オフライン英単語アプリ「LEAP」。AIがあなたの苦手を分析し、最適な順番で出題します。",
        theme_color: "#0a0e18",
        background_color: "#0a0e18",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,png,jpg,jpeg,json,woff2}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
