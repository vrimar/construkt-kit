#!/usr/bin/env node
// Unresolved Panda values emit literally rather than erroring, so nothing else catches them.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import knownCssProperties from "known-css-properties";
import { transform } from "lightningcss";

import { repoRoot, reportProblems } from "./lib.mjs";

const pandaCwd = path.join(repoRoot, "packages/ui");
const dataGridPreset = path.join(repoRoot, "packages/data-grid/src/preset/index.ts");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "preset-css-"));
const configPath = path.join(pandaCwd, "panda.check.ts");
const cssPath = path.join(tmpDir, "out.css");

fs.writeFileSync(
  configPath,
  `import { construktKitPreset } from "@construkt-kit/preset";
import { defineConfig } from "@pandacss/dev";
import { dataGridPreset } from ${JSON.stringify(dataGridPreset)};

export default defineConfig({
  preflight: false,
  presets: ["@pandacss/preset-base", construktKitPreset, dataGridPreset],
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

const requireFromUi = createRequire(path.join(pandaCwd, "package.json"));
const importFromUi = (specifier) => import(pathToFileURL(requireFromUi.resolve(specifier)).href);
const { construktKitPreset } = await importFromUi("@construkt-kit/preset");
const { preset: pandaBasePreset } = await importFromUi("@pandacss/preset-base");

const unparsable = transform({
  filename: "preset.css",
  code: Buffer.from(css),
  errorRecovery: true,
}).warnings.map(
  (w) => `${w.message} (line ${w.loc.line})\n    ${css.split("\n")[w.loc.line - 1]?.trim() ?? ""}`,
);

// Unresolved tokens emit verbatim with escaped dots; resolved ones keep them only in var(--sizes-4\.5).
const customProperty = /--[\w\\.-]+/g;
const escapedDot = /[\w-]\\\./;
const TIMING_PROPERTY = /^(animation|transition)-timing-function$/;
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
const isTimingFunction = (value) =>
  value.startsWith("var(") ||
  /^(cubic-bezier|steps|linear)\(/.test(value) ||
  value.split(",").every((v) => TIMING_KEYWORDS.has(v.trim()));

// Only a control whose hidden input takes focus sets data-focus-visible, so _focusVisible must also match :focus-visible.
const NARROWED_FOCUS_VISIBLE = /(?<!:focus-visible,\s*)\[data-focus-visible\]/;
const TABS_FOCUS_VISIBLE = /^\.tabs__trigger:is\(:focus-visible,\s*\[data-focus-visible\]\)$/;

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

// A responsive variant's media rule beats any plain variant rule, so two variant keys must never set one property.
const VARIANT_RULE =
  /^\.([a-z0-9]+(?:-[a-z0-9]+)*)(?:__([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*))?--([a-zA-Z0-9]+)_[^\s:.[>~+,]+(.*)$/;

// Panda 2.3 and 2.4+ order equal-specificity state rules differently, so states held at once need a compound rule.
const CO_OCCURRING = [
  ["open", "active"],
  ["on", "active"],
  ["disabled", "loading"],
  ["disabled", "readOnly"],
];
const conditions = [pandaBasePreset, construktKitPreset].reduce((merged, preset) => {
  const { extend, ...replaced } = preset.conditions ?? {};
  return { ...merged, ...replaced, ...extend };
}, {});
const slotSelector = (condition) =>
  typeof condition === "string"
    ? condition
    : Object.entries(condition)
        .map(([key, value]) => (value === "@slot" ? key : slotSelector(value)))
        .find(Boolean);
const STATES = Object.fromEntries(
  [...new Set(CO_OCCURRING.flat())].map((name) => [
    name,
    slotSelector(conditions[name]).replace(/^&/, ""),
  ]),
);

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
const parseDeclarations = (body) =>
  body
    .split(";")
    .map((declaration) => {
      const [property, ...rest] = declaration.split(":");
      return { property: property.trim(), value: rest.join(":").trim() };
    })
    .filter(({ value }) => value);

const RAW_ZAG_SELECTOR = /\[data-(scope|part|state)\b/;
const VAR_READ = /var\(\s*(--[\w\\.-]+)/g;

const kitRecipes = Object.values({
  ...construktKitPreset.theme.recipes,
  ...construktKitPreset.theme.slotRecipes,
});
const RECIPE_CLASS = new RegExp(
  `\\.(${kitRecipes.map((recipe) => recipe.className).join("|")})(?=__|--|[^\\w-]|$)`,
);
const sharedVars = new Set(Object.keys(construktKitPreset.globalVars ?? {}));
const inspectRecipe = (node, found) => {
  for (const [key, value] of Object.entries(node)) {
    if (RAW_ZAG_SELECTOR.test(key)) found.rawSelectors.add(key);
    if (typeof value === "string") {
      for (const [, name] of value.matchAll(VAR_READ)) found.read.add(name);
    } else if (value && typeof value === "object") {
      inspectRecipe(value, found);
    }
  }
  return found;
};
const recipeContract = new Map(
  kitRecipes.map((recipe) => [
    recipe.className,
    inspectRecipe(recipe, { rawSelectors: new Set(), read: new Set(), declared: new Set() }),
  ]),
);

const unresolved = [];
const invalidDeclarations = [];
const focusRings = [];
let tabsFocusVisible = false;
const variantValues = new Map();
const stateValues = new Map();

function inspectRule(head, ancestors, declarations) {
  for (const { property, value } of declarations) {
    const where = `${head} { ${property}: ${value} }`;
    if (escapedDot.test(value.replace(customProperty, ""))) {
      unresolved.push(`unresolved token\n    ${where}`);
    } else if (TIMING_PROPERTY.test(property) && !isTimingFunction(value)) {
      unresolved.push(`unknown timing function\n    ${where}`);
    }
  }
  if (head.startsWith("@property ")) sharedVars.add(head.split(/\s+/)[1]);
  if (head.startsWith("@")) return;

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

  const layer = ancestors[0];
  if (layer === "@layer tokens" || layer === "@layer base") {
    for (const { property } of declarations) {
      if (property.startsWith("--")) sharedVars.add(property);
    }
  } else if (layer?.startsWith("@layer recipes")) {
    const recipe = recipeContract.get(head.match(RECIPE_CLASS)?.[1]);
    for (const { property } of recipe ? declarations : []) {
      if (property.startsWith("--")) recipe.declared.add(property);
    }
  }

  const atRules = ancestors.filter((b) => b.startsWith("@"));
  const context = atRules.filter((b) => !b.startsWith("@layer")).join(" ");
  for (const selector of splitSelectors(head)) {
    if (NARROWED_FOCUS_VISIBLE.test(selector)) focusRings.push(selector);
    if (TABS_FOCUS_VISIBLE.test(selector)) tabsFocusVisible = true;

    const variant = selector.match(VARIANT_RULE);
    if (variant) {
      const [, recipe, slot, key, suffix] = variant;
      for (const { property, value } of declarations) {
        if (value.includes("!important")) continue;
        const id = `${recipe}${slot ? `__${slot}` : ""}${suffix.trim()} ${context}[${property}]`;
        const byKey = variantValues.get(id) ?? new Map();
        byKey.set(key, (byKey.get(key) ?? new Set()).add(value));
        variantValues.set(id, byKey);
      }
    }

    const parsed = parseStates(selector);
    if (parsed) {
      for (const { property, value } of declarations) {
        const id = `${parsed.base} ${atRules.join(" ")}[${property}]`;
        const byCombo = stateValues.get(id) ?? new Map();
        byCombo.set(parsed.combo, (byCombo.get(parsed.combo) ?? new Set()).add(value));
        stateValues.set(id, byCombo);
      }
    }
  }
}

const blocks = [];
let buffer = "";
for (const ch of css) {
  if (ch === "{") {
    blocks.push(buffer.trim());
    buffer = "";
  } else if (ch === "}") {
    const head = blocks.pop() ?? "";
    inspectRule(head, blocks, parseDeclarations(buffer));
    buffer = "";
  } else if (ch === ";" && blocks.length === 0) {
    buffer = "";
  } else {
    buffer += ch;
  }
}

if (!tabsFocusVisible) {
  focusRings.push(".tabs__trigger has no :is(:focus-visible, [data-focus-visible]) rule");
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

const contractBreaks = [...recipeContract].flatMap(
  ([className, { rawSelectors, read, declared }]) =>
    [
      ...[...rawSelectors].map((selector) => `raw selector ${selector}`),
      ...[...read]
        .filter((name) => !declared.has(name) && !sharedVars.has(name))
        .map((name) => `unregistered variable ${name}`),
    ].map((why) => `${className}: ${why}`),
);

const CHECKS = [
  {
    what: "rule(s) a CSS parser rejects, which a minifier drops or fails on",
    found: unparsable,
    advice: "Quote attribute values that aren't identifiers, e.g. [data-depth='3'].",
  },
  {
    what: "unresolved value(s) in the generated CSS",
    found: unresolved,
    advice: "Check the token exists in packages/preset/src/theme/tokens/.",
  },
  {
    what: "declaration(s) the browser drops or draws nothing for",
    found: invalidDeclarations,
    advice:
      "Use Panda's real utilities (e.g. focusVisibleRing, not Tailwind ring*) and give strokes a style.",
  },
  {
    what: "property set by more than one variant key",
    found: overlaps,
    advice: "Set a CSS variable in each variant and resolve the property once in the base.",
  },
  {
    what: "focus-visible selector(s) narrower than Panda's focusVisible",
    found: focusRings,
    advice: "Don't override focusVisible; add a separately named condition instead.",
  },
  {
    what: "state pair(s) whose winner depends on Panda's rule order",
    found: stateConflicts,
    advice:
      "Nest one state inside the other (e.g. _open: { _active: {...} }) so the winner is explicit.",
  },
  {
    what: "Panda contract break(s) in recipes",
    found: contractBreaks,
    advice:
      "Match state with Panda conditions (_open, _checked, …) and parts with data-slot, and register every variable a recipe reads but doesn't set in globalVars.",
  },
];
let failed = false;
for (const { what, found, advice } of CHECKS)
  failed = reportProblems(what, found, advice) || failed;
if (failed) process.exit(1);

console.log(
  `preset CSS clean — ${css.split("\n").length} lines, no unparsable rules, unresolved values, invalid declarations, variant overlaps, narrowed focus rings, order-dependent state pairs or Panda contract breaks.`,
);
