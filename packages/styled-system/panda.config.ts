import { constructKitPreset } from "@construct-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", constructKitPreset],
  outdir: "dist",
  importMap: "@construct-kit/styled-system",
  jsxFramework: "react",
});
