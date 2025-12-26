// vite.config.js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: '/map/',
  build: {
    outDir: "docs",
  },
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
