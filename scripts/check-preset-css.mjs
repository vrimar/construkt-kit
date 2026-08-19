#!/usr/bin/env node
// Unresolved Panda values emit literally rather than erroring, so nothing else catches them.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pandaCwd = path.join(repoRoot, "packages/styled-system");

const TOKEN_CATEGORIES = [
  "aspectRatios", "animations", "assets", "blurs", "borders", "borderWidths",
  "breakpoints", "colors", "durations", "easings", "fonts", "fontSizes",
  "fontWeights", "gradients", "letterSpacings", "lineHeights", "opacity",
  "radii", "shadows", "sizes", "spacing", "zIndex",
];

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "preset-css-"));
const configPath = path.join(pandaCwd, "panda.check.ts");
const cssPath = path.join(tmpDir, "out.css");

fs.writeFileSync(
  configPath,
  `import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  presets: [construktKitPreset],
  outdir: "dist",
  importMap: "@construkt-kit/styled-system",
  jsxFramework: "react",
  staticCss: { recipes: "*" },
});
`,
);

let css;
try {
  execFileSync(
    "npx",
    ["panda", "cssgen", "--config", "panda.check.ts", "--outfile", cssPath],
    { cwd: pandaCwd, stdio: "pipe" },
  );
  css = fs.readFileSync(cssPath, "utf8");
} finally {
  fs.rmSync(configPath, { force: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const failures = [];

// A resolved token becomes var(--category-key); an unresolved one stays as `category.key`.
const tokenPath = new RegExp(
  `^\\s*([\\w-]+):\\s*(${TOKEN_CATEGORIES.join("|")})\\.([\\w.-]+);`,
);
const TIMING_KEYWORDS = new Set([
  "linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end",
  "inherit", "initial", "unset", "revert",
]);
const timingFn = /^\s*(animation|transition)-timing-function:\s*(.+);/;

css.split("\n").forEach((line, i) => {
  const token = line.match(tokenPath);
  if (token) {
    failures.push({ line: i + 1, text: line.trim(), why: `unresolved ${token[2]} token` });
    return;
  }
  const timing = line.match(timingFn);
  if (timing) {
    const value = timing[2].trim();
    const ok =
      value.startsWith("var(") ||
      /^(cubic-bezier|steps|linear)\(/.test(value) ||
      value.split(",").every((v) => TIMING_KEYWORDS.has(v.trim()));
    if (!ok) failures.push({ line: i + 1, text: line.trim(), why: "unknown timing function" });
  }
});

if (failures.length) {
  console.error(`\n${failures.length} unresolved value(s) in the generated CSS:\n`);
  for (const f of failures) console.error(`  ${f.why}\n    ${f.text}`);
  console.error("\nCheck the token exists in packages/preset/src/theme/tokens/.\n");
  process.exit(1);
}

console.log(`preset CSS clean — ${css.split("\n").length} lines, no unresolved values.`);
