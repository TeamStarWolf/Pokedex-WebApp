// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function manualChunks(id: string) {
  if (id.indexOf("react-router-dom") >= 0) return "router";
  if (id.indexOf("framer-motion") >= 0) return "motion";
  if (id.indexOf("recharts") >= 0) return "charts";
  if (id.indexOf("lucide-react") >= 0) return "icons";
  if (id.indexOf("react-dom") >= 0 || id.indexOf("/react/") >= 0 || id.indexOf("\\react\\") >= 0) return "react";
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  base: "/PokeNav/",
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
