import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { buildIndex } from "storybook/internal/core-server";

import { repoRoot, storybookConfigDir, storybookDir, storyIdsFile } from "./paths.ts";

const STORYBOOK_TAGS = new Set([
  "dev",
  "test",
  "manifest",
  "autodocs",
  "attached-mdx",
  "unattached-mdx",
]);

export interface IndexedStory {
  id: string;
  file: string;
  exportName: string;
  title: string;
  name: string;
  tags: string[];
}

export async function readStoryIndex(): Promise<IndexedStory[]> {
  process.env.STORYBOOK_DISABLE_TELEMETRY = "1";
  const cwd = process.cwd();
  process.chdir(storybookDir);
  try {
    const index = await buildIndex({ configDir: storybookConfigDir });
    return Object.values(index.entries)
      .filter((entry) => entry.type === "story")
      .map((entry) => ({
        id: entry.id,
        file: path.relative(repoRoot, path.resolve(storybookDir, entry.importPath)),
        exportName: (entry as { exportName: string }).exportName,
        title: entry.title,
        name: entry.name,
        tags: (entry.tags ?? []).filter((tag) => !STORYBOOK_TAGS.has(tag)),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  } finally {
    process.chdir(cwd);
  }
}

export function renderStoryIds(stories: IndexedStory[]): string {
  const body = stories
    .map(
      (story) =>
        `  ${JSON.stringify(story.id)}: { file: ${JSON.stringify(story.file)}, exportName: ${JSON.stringify(story.exportName)}, title: ${JSON.stringify(story.title)}, tags: ${JSON.stringify(story.tags)} },`,
    )
    .join("\n");
  return `export const stories = {\n${body}\n} as const satisfies Record<string, StoryEntry>;\n\nexport interface StoryEntry {\n  file: string;\n  exportName: string;\n  title: string;\n  tags: readonly string[];\n}\n\nexport type StoryId = keyof typeof stories;\n`;
}

export function formatTs(source: string, fileName: string): string {
  const result = spawnSync("pnpm", ["exec", "oxfmt", `--stdin-filepath=${fileName}`], {
    cwd: repoRoot,
    input: source,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`oxfmt failed for ${fileName}: ${result.stderr}`);
  }
  return result.stdout;
}

export async function generateStoryIds(): Promise<string> {
  return formatTs(renderStoryIds(await readStoryIndex()), storyIdsFile);
}

export async function writeStoryIds({ check }: { check: boolean }): Promise<boolean> {
  const next = await generateStoryIds();
  const current = fs.existsSync(storyIdsFile) ? fs.readFileSync(storyIdsFile, "utf8") : "";
  if (current === next) return true;
  if (check) return false;
  fs.writeFileSync(storyIdsFile, next);
  return true;
}
