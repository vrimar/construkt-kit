import path from "node:path";

import { dataGridPreset } from "@construkt-kit/data-grid/preset";
import { docsPreset } from "@construkt-kit/docs/preset";
import { construktKitPreset } from "@construkt-kit/preset";
import { STORY_GLOBS, repoRoot, storybookDir } from "@construkt-kit/story-kit/paths";
import { defineConfig } from "@pandacss/dev";

const fromHere = (glob: string) => `${path.relative(storybookDir, repoRoot)}/${glob}`;
const stories = STORY_GLOBS.map(fromHere);

export default process.env.CONSTRUKT_KIT_STORYBOOK_USE_DESIGN_SYSTEM === "1"
  ? defineConfig({
      designSystem: "@construkt-kit/pages",
      presets: [dataGridPreset, docsPreset],
      include: [...stories, fromHere("packages/ui/src/_shared/**/*.{ts,tsx}")],
      outdir: "styled-system",
    })
  : defineConfig({
      preflight: true,
      presets: ["@pandacss/preset-base", construktKitPreset, dataGridPreset, docsPreset],
      include: [
        ...stories,
        fromHere("packages/ui/src/**/*.{ts,tsx}"),
        fromHere("packages/pages/src/**/*.{ts,tsx}"),
      ],
      importMap: "#styled-system",
      outdir: "styled-system",
      staticCss: { recipes: "*" },
      jsxFramework: "react",
    });
