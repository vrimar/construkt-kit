// Snapshot the fully-resolved preset so a refactor can be proven output-neutral:
// build the preset, write a snapshot, refactor, write another, diff the two.
import fs from "node:fs";

const out = process.argv[2];
if (!out) {
  console.error("usage: node scripts/preset-snapshot.mjs <out.json>");
  process.exit(1);
}

const { construktKitPreset: preset } = await import("../packages/preset/dist/index.mjs");

const serializable = (_key, value) =>
  value instanceof RegExp || typeof value === "function" ? String(value) : value;

fs.writeFileSync(out, `${JSON.stringify(preset, serializable, 2)}\n`);
