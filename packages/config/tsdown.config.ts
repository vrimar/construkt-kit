import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "vite/index": "vite/index.ts",
    "playwright/index": "playwright/index.ts",
    "kubb/index": "kubb/index.ts",
    "oxlint/index": "oxlint/index.ts",
    "oxfmt/index": "oxfmt/index.ts",
    "tsdown/index": "tsdown/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
