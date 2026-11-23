import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { STORY_PACKAGES, baselineDir, repoRoot, storyKitDir } from "../paths.ts";
import { stories } from "../story-ids.gen.ts";
import { STALE_IDS_MESSAGE, writeStoryIds } from "./ids.ts";

const ALLOW_FILE = path.join(storyKitDir, "story-coverage-allow.json");
const SHEET_CASES_FILE = path.join(repoRoot, "packages/ui/src/components/sheetFrame.cases.ts");
const SHEET_FRAME_FILE = path.join(repoRoot, "packages/ui/src/components/Sheet/sheetFrame.tsx");
const SHEET_MODULE =
  /^import\s+(?!type\b)[^;]*?from\s+["'](?:\.\.?\/)+(?:primitives\/popup|popup)["']/m;

type Allowlist = Record<string, Record<string, string>>;

const rel = (file: string) => path.relative(repoRoot, file);

function walk(dir: string, test: (name: string) => boolean, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, test, out);
    else if (test(entry.name)) out.push(file);
  }
  return out;
}

async function exportCoverage(allow: Allowlist): Promise<string[]> {
  const problems: string[] = [];
  for (const pkg of STORY_PACKAGES) {
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
          `${rel(ALLOW_FILE)} lists ${pkg}/${name}, which a story now renders. Remove the entry.`,
        );
      }
    }
    for (const name of Object.keys(allowed)) {
      if (!exported.includes(name)) {
        problems.push(
          `${rel(ALLOW_FILE)} lists ${pkg}/${name}, which is no longer exported. Remove the entry.`,
        );
      }
    }
  }
  return problems;
}

async function sheetCoverage(): Promise<{ problems: string[]; overlays: number }> {
  const { sheetOverlayCases } = (await import(pathToFileURL(SHEET_CASES_FILE).href)) as {
    sheetOverlayCases: { story: string }[];
  };
  const storyFile = (id: string) => (stories as Record<string, { file: string }>)[id]?.file ?? "";
  const componentsDir = path.dirname(SHEET_CASES_FILE);
  const sheetUsers = walk(
    componentsDir,
    (name) => /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name),
  )
    .filter((file) => path.dirname(file) !== componentsDir && file !== SHEET_FRAME_FILE)
    .filter((file) => SHEET_MODULE.test(fs.readFileSync(file, "utf8")));
  const problems: string[] = [];
  for (const file of sheetUsers) {
    const dir = path.dirname(rel(file));
    if (!sheetOverlayCases.some((overlay) => path.dirname(storyFile(overlay.story)) === dir)) {
      problems.push(
        `${rel(file)} opens as a phone sheet, but no case in ${rel(SHEET_CASES_FILE)} drives a story in ${dir}.`,
      );
    }
    const openStateHere = Object.values(stories).some(
      (story) =>
        path.dirname(story.file) === dir &&
        (story.tags as readonly string[]).includes("open-state"),
    );
    if (!openStateHere) {
      problems.push(
        `${rel(file)} opens as a phone sheet, but no story in ${dir} is tagged open-state.`,
      );
    }
  }
  return { problems, overlays: sheetUsers.length };
}

function orphanBaselines(): string[] {
  if (!fs.existsSync(baselineDir)) return [];
  const storyIds = Object.keys(stories);
  return walk(baselineDir, (name) => name.endsWith(".png") || name.endsWith(".aria.yml"))
    .filter((file) => {
      const name = path.basename(file).replace(/\.(png|aria\.yml)$/, "");
      return !storyIds.some((id) => name === id || name.startsWith(`${id}--`));
    })
    .map((file) => `${rel(file)} has no story; delete it.`);
}

export async function checkStoryCoverage(): Promise<number> {
  const problems: string[] = [];
  if (!(await writeStoryIds({ check: true }))) problems.push(STALE_IDS_MESSAGE);
  const allow = JSON.parse(fs.readFileSync(ALLOW_FILE, "utf8")) as Allowlist;
  problems.push(...(await exportCoverage(allow)));
  const sheets = await sheetCoverage();
  problems.push(...sheets.problems, ...orphanBaselines());

  if (problems.length > 0) {
    process.stderr.write(`\n${problems.length} story coverage problem(s):\n\n`);
    for (const problem of problems) process.stderr.write(`  ${problem}\n`);
    process.stderr.write("\n");
    return 1;
  }
  process.stdout.write(
    `story coverage clean: ${Object.keys(stories).length} stories, ${sheets.overlays} sheet overlays.\n`,
  );
  return 0;
}
