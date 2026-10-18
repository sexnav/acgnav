import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "app",
  publicDir: "static",
  build: { outDir: "../public", emptyOutDir: true },
  plugins: [react()],
});
