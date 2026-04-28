import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";

const useUiBuildInfo = process.env.CONSTRUKT_KIT_STORYBOOK_USE_BUILDINFO === "1";

const include = useUiBuildInfo
  ? [
      "../../packages/ui/dist/panda.buildinfo.json",
      "../../packages/ui/src/**/*.stories.{ts,tsx}",
      "../../packages/pages/src/**/*.{ts,tsx}",
    ]
  : ["../../packages/ui/src/**/*.{ts,tsx}", "../../packages/pages/src/**/*.{ts,tsx}"];

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", construktKitPreset],
  include,
  exclude: [],
  importMap: "@construkt-kit/styled-system",
  outdir: "styled-system",
  jsxFramework: "react",
});
