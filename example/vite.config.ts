import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Requests markdown-live-editor's own `"source"` export condition (see
  // its package.json) so this resolves straight to `../src/index.ts`
  // instead of the built `dist/` a real npm consumer would get — no build
  // step needed for edits here to hot-reload into this example app.
  resolve: {
    conditions: ["source"],
  },
});
