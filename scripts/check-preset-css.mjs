#!/usr/bin/env node
// Unresolved Panda values emit literally rather than erroring, so nothing else catches them.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pandaCwd = path.join(repoRoot, "packages/ui");

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
  presets: ["@pandacss/preset-base", construktKitPreset],
  outdir: ${JSON.stringify(path.join(tmpDir, "styled-system"))},
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

// A resolved token becomes var(--category-key); an unresolved one stays as `category\.key`.
const tokenPath = new RegExp(
  `^\\s*([\\w-]+):\\s*(${TOKEN_CATEGORIES.join("|")})\\\\?\\.([\\w.\\\\-]+);`,
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

// Ark sets data-focus-visible on only some parts, so _focusVisible must also match :focus-visible.
const NARROWED_FOCUS_VISIBLE = /(?<!:focus-visible,\s*)\[data-focus-visible\]/;
const TABS_FOCUS_VISIBLE = /^\s*\.tabs__trigger:is\(:focus-visible,\s*\[data-focus-visible\]\)\s*\{/m;
const focusRings = css
  .split("\n")
  .filter((line) => NARROWED_FOCUS_VISIBLE.test(line))
  .map((line) => line.trim());
if (!TABS_FOCUS_VISIBLE.test(css)) {
  focusRings.push(".tabs__trigger has no :is(:focus-visible, [data-focus-visible]) rule");
}

// Panda 2 emits variant rules in usage-dependent order, so two variant keys must never set one property.
const VARIANT_RULE =
  /^\.([a-z0-9]+(?:-[a-z0-9]+)*)(?:__([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*))?--([a-zA-Z0-9]+)_[^\s:.[>~+,]+(.*)$/;
const variantValues = new Map();
const blocks = [];
let buffer = "";
for (const ch of css) {
  if (ch === "{") {
    blocks.push(buffer.trim());
    buffer = "";
  } else if (ch === "}") {
    const head = blocks.pop() ?? "";
    if (!head.startsWith("@")) {
      const context = blocks.filter((b) => b.startsWith("@") && !b.startsWith("@layer")).join(" ");
      for (const selector of head.split(",")) {
        const match = selector.trim().match(VARIANT_RULE);
        if (!match) continue;
        const [, recipe, slot, key, suffix] = match;
        for (const declaration of buffer.split(";")) {
          const [property, ...rest] = declaration.split(":");
          const value = rest.join(":").trim();
          if (!value || value.includes("!important")) continue;
          const id = `${recipe}${slot ? `__${slot}` : ""}${suffix.trim()} ${context}[${property.trim()}]`;
          const byKey = variantValues.get(id) ?? new Map();
          byKey.set(key, (byKey.get(key) ?? new Set()).add(value));
          variantValues.set(id, byKey);
        }
      }
    }
    buffer = "";
  } else if (ch === ";" && blocks.length === 0) {
    buffer = "";
  } else {
    buffer += ch;
  }
}
const overlaps = [...variantValues]
  .filter(([, byKey]) => byKey.size > 1 && new Set([...byKey.values()].flatMap((v) => [...v])).size > 1)
  .map(([id, byKey]) => `${id} set by variants ${[...byKey.keys()].join(", ")}`);

if (failures.length || overlaps.length || focusRings.length) {
  if (failures.length) {
    console.error(`\n${failures.length} unresolved value(s) in the generated CSS:\n`);
    for (const f of failures) console.error(`  ${f.why}\n    ${f.text}`);
    console.error("\nCheck the token exists in packages/preset/src/theme/tokens/.\n");
  }
  if (overlaps.length) {
    console.error(`\n${overlaps.length} property set by more than one variant key:\n`);
    for (const o of overlaps) console.error(`  ${o}`);
    console.error("\nSet a CSS variable in each variant and resolve the property once in the base.\n");
  }
  if (focusRings.length) {
    console.error(`\n${focusRings.length} focus-visible selector(s) narrower than Panda's focusVisible:\n`);
    for (const r of focusRings) console.error(`  ${r}`);
    console.error("\nDon't override focusVisible; add a separately named condition instead.\n");
  }
  process.exit(1);
}

console.log(
  `preset CSS clean — ${css.split("\n").length} lines, no unresolved values, variant overlaps or narrowed focus rings.`,
);
