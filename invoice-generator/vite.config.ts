import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the built app can be opened straight from disk
  // (file://) or served from any subpath, not just domain root.
  base: "./",
  server: {
    // During `npm run dev`, proxy API calls to the Express + SQLite
    // server (run separately via `npm run server`) so the frontend can
    // just fetch("/api/...") without worrying about CORS or ports.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
