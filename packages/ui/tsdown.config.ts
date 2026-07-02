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
    // Regex (not a plain string) so the /recipes, /jsx… subpaths stay external for consumer codegen.
    neverBundle: [
      "react",
      "react-dom",
      "@construkt-kit/preset",
      /^@construkt-kit\/styled-system(\/|$)/,
      "@pandacss/dev",
    ],
  },
});
