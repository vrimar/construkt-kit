import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", construktKitPreset],
  outdir: "dist",
  importMap: "@construkt-kit/styled-system",
  jsxFramework: "react",
});
