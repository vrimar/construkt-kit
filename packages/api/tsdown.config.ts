import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  deps: { neverBundle: ["react", "@kubb/plugin-client", "@kubb/core"] },
});
