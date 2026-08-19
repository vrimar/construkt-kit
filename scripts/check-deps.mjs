#!/usr/bin/env node
// knip would cover this, but it caps its typescript peer at <7 and this repo is on 7.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", ".panda", "styled-system", "storybook-static"]);
const SOURCE = /\.(ts|tsx|mjs|cjs|js|jsx)$/;

// Imported for side effects or by tooling convention, so no import statement names them.
const ASSUMED_USED = new Set([
  "tsdown", "vitest", "oxfmt", "oxlint", "oxlint-tsgolint", "typescript", "turbo",
  "publint", "@arethetypeswrong/cli", "jsdom", "@types/react", "@types/react-dom",
  "@types/node", "postcss",
]);

// Storybook discovers these through glob patterns in .storybook/main.ts, never an import.
const IGNORE_UNIMPORTED = {
  "apps/storybook": ["@construkt-kit/pages", "@construkt-kit/ui"],
};

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SOURCE.test(e.name)) out.push(p);
  }
  return out;
}

const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i;

function packageNameOf(specifier) {
  if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("@/")) return null;
  if (specifier.startsWith("node:")) return null;
  const parts = specifier.split("/");
  const name = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  return PACKAGE_NAME.test(name) ? name : null;
}

const workspaceDirs = ["packages", "apps"]
  .flatMap((root) =>
    fs.existsSync(path.join(repoRoot, root))
      ? fs.readdirSync(path.join(repoRoot, root)).map((d) => path.join(root, d))
      : [],
  )
  .filter((d) => fs.existsSync(path.join(repoRoot, d, "package.json")));

const problems = [];

for (const dir of workspaceDirs) {
  const abs = path.join(repoRoot, dir);
  const pkg = JSON.parse(fs.readFileSync(path.join(abs, "package.json"), "utf8"));
  const declared = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ]);

  const files = walk(abs);
  const imported = new Set();
  const valueImported = new Set();
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    const record = (specifier, statement) => {
      const name = packageNameOf(specifier);
      if (!name) return;
      imported.add(name);
      // `import type X` / `export type { … }` erase at build; a bare `type` inside the
      // braces does not make the whole statement type-only.
      if (!/\b(?:import|export)[ \t]+type\b/.test(statement)) valueImported.add(name);
    };

    for (const m of text.matchAll(
      /(?<!["'\w])(?:import|export)\b[\s\S]{0,400}?\bfrom[ \t]*["']([^"'\n]+)["']/g,
    )) {
      record(m[1], m[0]);
    }
    for (const m of text.matchAll(/(?<!["'\w])import[ \t]*\(?[ \t]*["']([^"'\n]+)["']/g)) {
      record(m[1], m[0]);
    }
    for (const m of text.matchAll(/(?<!["'\w])require[ \t]*\([ \t]*["']([^"'\n]+)["']/g)) {
      record(m[1], m[0]);
    }
  }

  const ignored = new Set(IGNORE_UNIMPORTED[dir] ?? []);
  const runtime = new Set(Object.keys(pkg.dependencies ?? {}));
  for (const dep of runtime) {
    if (ASSUMED_USED.has(dep) || ignored.has(dep)) continue;
    if (!imported.has(dep)) {
      problems.push(`${dir}: declares "${dep}" as a runtime dependency but never imports it`);
    } else if (!valueImported.has(dep)) {
      problems.push(
        `${dir}: "${dep}" is only ever imported as a type — it belongs in devDependencies`,
      );
    }
  }
  for (const name of imported) {
    if (!declared.has(name) && !ASSUMED_USED.has(name)) {
      problems.push(`${dir}: imports "${name}" without declaring it`);
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} dependency problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}

console.log(`dependencies clean across ${workspaceDirs.length} workspaces.`);
