import { b3Preset } from "@b3/preset";
import { defineConfig } from "@pandacss/dev";

const useUiBuildInfo = process.env.B3_STORYBOOK_USE_BUILDINFO === "1";

const include = useUiBuildInfo
  ? [
      "../../packages/ui/dist/panda.buildinfo.json",
      "../../packages/ui/src/**/*.stories.{ts,tsx}",
      "../../packages/pages/src/**/*.{ts,tsx}",
    ]
  : ["../../packages/ui/src/**/*.{ts,tsx}", "../../packages/pages/src/**/*.{ts,tsx}"];

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", b3Preset],
  include,
  exclude: [],
  importMap: "@b3/styled-system",
  outdir: "styled-system",
  jsxFramework: "react",
});
