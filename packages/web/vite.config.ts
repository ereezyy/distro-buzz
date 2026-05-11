import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Resolve supabase-js from the monorepo root node_modules, since pnpm
// hoists it there and the workspace web package doesn't have its own copy.
const supabaseJsEntry = path.resolve(
  __dirname,
  "../../node_modules/@supabase/supabase-js/dist/index.mjs"
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/_core": path.resolve(__dirname, "./src/_core"),
      "sonner": path.resolve(__dirname, "./src/components/ui/sonner.tsx"),
      "@supabase/supabase-js": supabaseJsEntry,
    },
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
  },
  build: {
    outDir: "dist",
  },
});
