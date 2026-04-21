import { defineConfig } from "@pandacss/dev";

import { b3Preset } from "../../packages/ui/src/preset";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", b3Preset],
  include: ["../../packages/ui/src/**/*.{ts,tsx}", "../../packages/pages/src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
});
