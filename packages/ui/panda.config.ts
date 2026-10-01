import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";
import { preset as pandaBasePreset } from "@pandacss/preset-base";

export default defineConfig({
  preflight: true,
  presets: [pandaBasePreset, construktKitPreset],
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/**/*.stories.{ts,tsx}", "./src/_shared/**"],
  outdir: "styled-system",
  forceImportExtension: true,
  importMap: "#styled-system",
  jsxFramework: "react",
  staticCss: { recipes: "*" },
});
