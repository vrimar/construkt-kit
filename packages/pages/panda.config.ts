import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  designSystem: "@construkt-kit/ui",
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/**/*.stories.{ts,tsx}"],
  outdir: "styled-system",
});
