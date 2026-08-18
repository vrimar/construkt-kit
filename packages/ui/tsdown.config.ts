import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
    panda: "src/panda.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  checks: {
    pluginTimings: false,
  },
  deps: {
    // @construkt-kit/styled-system is private and unpublished, so it must be bundled:
    // consumers reach the Panda runtime through this package's re-exports.
    neverBundle: ["react", "react-dom", "@construkt-kit/preset", "@pandacss/dev"],
  },
});
