import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  checks: {
    pluginTimings: false,
  },
  deps: {
    neverBundle: ["react", "react-dom", "@construkt-kit/preset", "@construkt-kit/styled-system"],
  },
});
