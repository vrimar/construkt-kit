import { b3Preset } from "@b3/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", b3Preset],
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/**/*.stories.{ts,tsx}"],
  outdir: ".panda",
  importMap: "@b3/styled-system",
  jsxFramework: "react",
});
