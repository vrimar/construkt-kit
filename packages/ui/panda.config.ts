import { constructKitPreset } from "@construct-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", constructKitPreset],
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/**/*.stories.{ts,tsx}"],
  outdir: ".panda",
  importMap: "@construct-kit/styled-system",
  jsxFramework: "react",
});
