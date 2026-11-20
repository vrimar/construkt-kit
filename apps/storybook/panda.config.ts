import { dataGridPreset } from "@construkt-kit/data-grid/preset";
import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default process.env.CONSTRUKT_KIT_STORYBOOK_USE_DESIGN_SYSTEM === "1"
  ? defineConfig({
      designSystem: "@construkt-kit/pages",
      presets: [dataGridPreset],
      include: [
        "./stories/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.stories.{ts,tsx}",
        "../../packages/ui/src/_shared/**/*.{ts,tsx}",
        "../../packages/pages/src/**/*.stories.{ts,tsx}",
        "../../packages/data-grid/src/**/*.stories.{ts,tsx}",
      ],
      outdir: "styled-system",
    })
  : defineConfig({
      preflight: true,
      presets: ["@pandacss/preset-base", construktKitPreset, dataGridPreset],
      include: [
        "./stories/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}",
        "../../packages/pages/src/**/*.{ts,tsx}",
        "../../packages/data-grid/src/**/*.stories.{ts,tsx}",
      ],
      importMap: "#styled-system",
      outdir: "styled-system",
      staticCss: { recipes: "*" },
      jsxFramework: "react",
    });
