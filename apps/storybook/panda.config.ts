import { b3Preset } from "@b3/ui/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", b3Preset],
  include: ["../../packages/ui/src/**/*.{ts,tsx}", "../../packages/pages/src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
});
