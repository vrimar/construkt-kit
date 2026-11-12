#!/usr/bin/env node
// Unresolved Panda values emit literally rather than erroring, so nothing else catches them.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import knownCssProperties from "known-css-properties";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pandaCwd = path.join(repoRoot, "packages/ui");

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
  execFileSync("npx", ["panda", "cssgen", "--config", "panda.check.ts", "--outfile", cssPath], {
    cwd: pandaCwd,
    stdio: "pipe",
  });
  css = fs.readFileSync(cssPath, "utf8");
} finally {
  fs.rmSync(configPath, { force: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const failures = [];

// Unresolved tokens emit verbatim with escaped dots; resolved ones keep them only in var(--sizes-4\.5).
const declarationValue = /^\s*[^\s:{}]+:\s*(.+);/;
const customProperty = /--[\w\\.-]+/g;
const escapedDot = /[\w-]\\\./;
const TIMING_KEYWORDS = new Set([
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "step-start",
  "step-end",
  "inherit",
  "initial",
  "unset",
  "revert",
]);
const timingFn = /^\s*(animation|transition)-timing-function:\s*(.+);/;

css.split("\n").forEach((line, i) => {
  const declared = line.match(declarationValue)?.[1].replace(customProperty, "");
  if (declared && escapedDot.test(declared)) {
    failures.push({ line: i + 1, text: line.trim(), why: "unresolved token" });
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
const TABS_FOCUS_VISIBLE =
  /^\s*\.tabs__trigger:is\(:focus-visible,\s*\[data-focus-visible\]\)\s*\{/m;
const focusRings = css
  .split("\n")
  .filter((line) => NARROWED_FOCUS_VISIBLE.test(line))
  .map((line) => line.trim());
if (!TABS_FOCUS_VISIBLE.test(css)) {
  focusRings.push(".tabs__trigger has no :is(:focus-visible, [data-focus-visible]) rule");
}

const KNOWN_PROPERTIES = new Set(knownCssProperties.all);
// An outline/border shorthand without a line style resets the style to none and draws nothing.
const STROKE_SHORTHAND =
  /^(outline|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?)$/;
const LINE_STYLES = new Set([
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "auto",
]);
const NO_STROKE = new Set(["0", "inherit", "initial", "unset", "revert", "revert-layer"]);
const invalidDeclarations = [];

// A responsive variant's media rule beats any plain variant rule, so two variant keys must never set one property.
const VARIANT_RULE =
  /^\.([a-z0-9]+(?:-[a-z0-9]+)*)(?:__([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*))?--([a-zA-Z0-9]+)_[^\s:.[>~+,]+(.*)$/;
const variantValues = new Map();

// Panda 2.3 and 2.4+ order equal-specificity state rules differently, so states held at once need a compound rule.
const ENABLED = ":where(:not(:disabled, [data-disabled]))";
const STATES = {
  open: ':is([open], [data-open], [data-state="open"], :popover-open)',
  on: ":is([data-state=on])",
  active: `${ENABLED}:is(:active, [data-active])`,
  hover: `${ENABLED}:where(:hover, [data-hover])`,
  disabled: ":is(:disabled, [disabled], [data-disabled], [aria-disabled=true])",
  loading: ":is([data-loading], [aria-busy=true])",
  readonly: "[data-readonly]",
};
const CO_OCCURRING = [
  ["open", "active"],
  ["on", "active"],
  ["disabled", "loading"],
  ["disabled", "readonly"],
];
const stateValues = new Map();
const splitSelectors = (head) => {
  const out = [];
  let depth = 0;
  let current = "";
  for (const ch of head) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  return [...out, current.trim()];
};
const parseStates = (selector) => {
  const base = selector.match(/^\.[\w-]+/)?.[0];
  if (!base) return null;
  const states = [];
  for (let rest = selector.slice(base.length); rest;) {
    const name = Object.keys(STATES).find((key) => rest.startsWith(STATES[key]));
    if (!name) return null;
    states.push(name);
    rest = rest.slice(STATES[name].length);
  }
  return states.length ? { base, combo: states.sort().join("+") } : null;
};

const blocks = [];
let buffer = "";
for (const ch of css) {
  if (ch === "{") {
    blocks.push(buffer.trim());
    buffer = "";
  } else if (ch === "}") {
    const head = blocks.pop() ?? "";
    if (!head.startsWith("@")) {
      const declarations = buffer
        .split(";")
        .map((declaration) => {
          const [property, ...rest] = declaration.split(":");
          return { property: property.trim(), value: rest.join(":").trim() };
        })
        .filter(({ value }) => value);
      for (const { property, value } of declarations) {
        const where = `${head} { ${property}: ${value} }`;
        if (!property.startsWith("--") && !KNOWN_PROPERTIES.has(property)) {
          invalidDeclarations.push(`unknown property\n    ${where}`);
        } else if (
          STROKE_SHORTHAND.test(property) &&
          !value.includes("var(") &&
          !NO_STROKE.has(value) &&
          !value.split(/\s+/).some((v) => LINE_STYLES.has(v))
        ) {
          invalidDeclarations.push(`shorthand without a line style\n    ${where}`);
        }
      }
      const context = blocks.filter((b) => b.startsWith("@") && !b.startsWith("@layer")).join(" ");
      for (const selector of head.split(",")) {
        const match = selector.trim().match(VARIANT_RULE);
        if (!match) continue;
        const [, recipe, slot, key, suffix] = match;
        for (const { property, value } of declarations) {
          if (value.includes("!important")) continue;
          const id = `${recipe}${slot ? `__${slot}` : ""}${suffix.trim()} ${context}[${property}]`;
          const byKey = variantValues.get(id) ?? new Map();
          byKey.set(key, (byKey.get(key) ?? new Set()).add(value));
          variantValues.set(id, byKey);
        }
      }
      const layers = blocks.filter((b) => b.startsWith("@")).join(" ");
      for (const selector of splitSelectors(head)) {
        const parsed = parseStates(selector);
        if (!parsed) continue;
        for (const { property, value } of declarations) {
          const id = `${parsed.base} ${layers}[${property}]`;
          const byCombo = stateValues.get(id) ?? new Map();
          byCombo.set(parsed.combo, (byCombo.get(parsed.combo) ?? new Set()).add(value));
          stateValues.set(id, byCombo);
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
  .filter(
    ([, byKey]) => byKey.size > 1 && new Set([...byKey.values()].flatMap((v) => [...v])).size > 1,
  )
  .map(([id, byKey]) => `${id} set by variants ${[...byKey.keys()].join(", ")}`);

const stateConflicts = [...stateValues].flatMap(([id, byCombo]) =>
  CO_OCCURRING.filter(([a, b]) => {
    const one = byCombo.get(a);
    const other = byCombo.get(b);
    return (
      one && other && [...one].join() !== [...other].join() && !byCombo.has([a, b].sort().join("+"))
    );
  }).map(([a, b]) => `${id} differs for ${a} and ${b}`),
);

if (
  failures.length ||
  invalidDeclarations.length ||
  overlaps.length ||
  focusRings.length ||
  stateConflicts.length
) {
  if (failures.length) {
    console.error(`\n${failures.length} unresolved value(s) in the generated CSS:\n`);
    for (const f of failures) console.error(`  ${f.why}\n    ${f.text}`);
    console.error("\nCheck the token exists in packages/preset/src/theme/tokens/.\n");
  }
  if (invalidDeclarations.length) {
    console.error(
      `\n${invalidDeclarations.length} declaration(s) the browser drops or draws nothing for:\n`,
    );
    for (const d of invalidDeclarations) console.error(`  ${d}`);
    console.error(
      "\nUse Panda's real utilities (e.g. focusVisibleRing, not Tailwind ring*) and give strokes a style.\n",
    );
  }
  if (overlaps.length) {
    console.error(`\n${overlaps.length} property set by more than one variant key:\n`);
    for (const o of overlaps) console.error(`  ${o}`);
    console.error(
      "\nSet a CSS variable in each variant and resolve the property once in the base.\n",
    );
  }
  if (focusRings.length) {
    console.error(
      `\n${focusRings.length} focus-visible selector(s) narrower than Panda's focusVisible:\n`,
    );
    for (const r of focusRings) console.error(`  ${r}`);
    console.error("\nDon't override focusVisible; add a separately named condition instead.\n");
  }
  if (stateConflicts.length) {
    console.error(
      `\n${stateConflicts.length} state pair(s) whose winner depends on Panda's rule order:\n`,
    );
    for (const c of stateConflicts) console.error(`  ${c}`);
    console.error(
      "\nNest one state inside the other (e.g. _open: { _active: {...} }) so the winner is explicit.\n",
    );
  }
  process.exit(1);
}

console.log(
  `preset CSS clean — ${css.split("\n").length} lines, no unresolved values, invalid declarations, variant overlaps, narrowed focus rings or order-dependent state pairs.`,
);
