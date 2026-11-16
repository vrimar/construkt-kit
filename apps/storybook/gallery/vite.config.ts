import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { kitResolution, repoRoot } from "../vite.shared.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = kitResolution();

export default defineConfig({
  root: here,
  plugins: [react(), ...kit.plugins],
  resolve: { alias: kit.alias, dedupe: kit.dedupe },
  optimizeDeps: {
    include: kit.optimizeDepsInclude,
    entries: [path.join(here, "index.html")],
  },
  build: {
    outDir: path.resolve(here, "../gallery-dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4096,
    rolldownOptions: { checks: { pluginTimings: false } },
  },
  server: { fs: { allow: [repoRoot] } },
});
