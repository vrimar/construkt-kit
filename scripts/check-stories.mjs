#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["ui", "pages", "data-grid"];
const BASELINES = path.join(repoRoot, "apps/storybook/__baselines__");
const SHEET_MODULE =
  /^import\s+(?!type\b)[^;]*?from\s+["'](?:\.\.?\/)+(?:overlayPresentation|pickerPopup)["']/m;

const problems = [];
const rel = (file) => path.relative(repoRoot, file);
const importTs = (file) => import(pathToFileURL(path.join(repoRoot, file)).href);

function walk(dir, test, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, test, out);
    else if (test(entry.name)) out.push(file);
  }
  return out;
}

const ids = spawnSync(
  process.execPath,
  ["packages/story-kit/src/bin/story-kit.ts", "ids", "--check"],
  {
    cwd: repoRoot,
    encoding: "utf8",
  },
);
if (ids.status !== 0) {
  problems.push(
    "packages/story-kit/src/story-ids.gen.ts is stale: run `pnpm stories:ids` and commit it.",
  );
}

const { stories } = await importTs("packages/story-kit/src/story-ids.gen.ts");
const allow = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "scripts/story-coverage-allow.json"), "utf8"),
);

for (const pkg of PACKAGES) {
  const dist = path.join(repoRoot, "packages", pkg, "dist/index.mjs");
  const exported = Object.keys(await import(pathToFileURL(dist).href)).filter((name) =>
    /^[A-Z][A-Za-z0-9]*$/.test(name),
  );
  const storyText = walk(path.join(repoRoot, "packages", pkg, "src"), (name) =>
    name.endsWith(".stories.tsx"),
  )
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  const allowed = allow[pkg] ?? {};
  for (const name of exported) {
    const rendered = new RegExp(
      `<${name}[\\s/>.]|\\b${name}\\.[A-Z]|component:\\s*${name}\\b`,
    ).test(storyText);
    if (!rendered && !(name in allowed)) {
      problems.push(
        `@construkt-kit/${pkg} exports ${name}, which no story renders. Add a story, or an allowlist entry with a reason.`,
      );
    }
    if (rendered && name in allowed) {
      problems.push(
        `scripts/story-coverage-allow.json lists ${pkg}/${name}, which a story now renders. Remove the entry.`,
      );
    }
  }
  for (const name of Object.keys(allowed)) {
    if (!exported.includes(name)) {
      problems.push(
        `scripts/story-coverage-allow.json lists ${pkg}/${name}, which is no longer exported. Remove the entry.`,
      );
    }
  }
}

const { sheetOverlayCases } = await importTs("packages/ui/src/components/sheetFrame.cases.ts");
const componentsDir = path.join(repoRoot, "packages/ui/src/components");
const sheetUsers = walk(
  componentsDir,
  (name) => /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name),
)
  .filter((file) => path.dirname(file) !== componentsDir)
  .filter((file) => SHEET_MODULE.test(fs.readFileSync(file, "utf8")));
for (const file of sheetUsers) {
  const dir = path.dirname(rel(file));
  const storiesHere = Object.entries(stories).filter(
    ([, story]) => path.dirname(story.file) === dir,
  );
  if (
    !sheetOverlayCases.some((overlay) => path.dirname(stories[overlay.story]?.file ?? "") === dir)
  ) {
    problems.push(
      `${rel(file)} opens as a phone sheet, but no case in packages/ui/src/components/sheetFrame.cases.ts drives a story in ${dir}.`,
    );
  }
  if (!storiesHere.some(([, story]) => story.tags.includes("open-state"))) {
    problems.push(
      `${rel(file)} opens as a phone sheet, but no story in ${dir} is tagged open-state.`,
    );
  }
}

if (fs.existsSync(BASELINES)) {
  const storyIds = Object.keys(stories);
  for (const file of walk(
    BASELINES,
    (name) => name.endsWith(".png") || name.endsWith(".aria.yml"),
  )) {
    const name = path.basename(file).replace(/\.(png|aria\.yml)$/, "");
    if (!storyIds.some((id) => name === id || name.startsWith(`${id}--`))) {
      problems.push(`${rel(file)} has no story; delete it.`);
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} story coverage problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error("");
  process.exit(1);
}

console.log(
  `story coverage clean: ${Object.keys(stories).length} stories, ${sheetUsers.length} sheet overlays.`,
);
