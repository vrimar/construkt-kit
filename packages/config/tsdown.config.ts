import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "vite/index": "vite/index.ts",
    "playwright/index": "playwright/index.ts",
    "kubb/index": "kubb/index.ts",
    "oxlint/index": "oxlint/index.config.ts",
    "oxfmt/index": "oxfmt/index.config.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
});
