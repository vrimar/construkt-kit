import { b3Preset } from "@b3/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", b3Preset],
  outdir: "dist",
  importMap: "@b3/styled-system",
  jsxFramework: "react",
});
