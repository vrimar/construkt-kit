import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", construktKitPreset],
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/**/*.stories.{ts,tsx}", "./src/_shared/**"],
  outdir: ".panda",
  importMap: "@construkt-kit/styled-system",
  jsxFramework: "react",
});
