// Snapshot the fully-resolved preset so a refactor can be proven output-neutral:
// build the preset, write a snapshot, refactor, write another, diff the two.
import fs from "node:fs";

const out = process.argv[2];
if (!out) {
  console.error("usage: node scripts/preset-snapshot.mjs <out.json>");
  process.exit(1);
}

const { construktKitPreset: preset } = await import("../packages/preset/dist/index.mjs");
const theme = preset.theme;

fs.writeFileSync(
  out,
  `${JSON.stringify(
    {
      recipes: theme.recipes,
      slotRecipes: theme.slotRecipes,
      tokens: theme.tokens,
      semanticTokens: theme.extend?.semanticTokens ?? theme.semanticTokens,
      textStyles: theme.textStyles,
      layerStyles: theme.layerStyles,
      keyframes: theme.keyframes,
      animationStyles: theme.animationStyles,
      breakpoints: theme.breakpoints,
    },
    null,
    2,
  )}\n`,
);
