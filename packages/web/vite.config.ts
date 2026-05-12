import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/_core": path.resolve(__dirname, "./src/_core"),
      "sonner": path.resolve(__dirname, "./src/components/ui/sonner.tsx"),
    },
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../../node_modules"),
      "node_modules",
    ],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["@supabase/supabase-js"],
      output: {
        globals: {
          "@supabase/supabase-js": "supabase",
        },
      },
    },
  },
});
