import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { DockerUnavailableError, freePort, startBrowser } from "./browser.ts";
import { affectedStories } from "./changed.ts";
import { writeStoryIds } from "./ids.ts";
import { reportDir, repoRoot, storyKitDir, storybookDir } from "./paths.ts";

export interface RunOptions {
  playwrightArgs: string[];
  changedSince?: string;
  only?: string[];
  update?: "missing" | "aria";
  env?: Record<string, string>;
}

function playwrightCli(): string {
  return createRequire(path.join(storyKitDir, "package.json")).resolve("@playwright/test/cli");
}

const UPDATE_FLAGS = /^(-u|--update-snapshots)(=.*)?$/;

function buildGallery(): void {
  const result = spawnSync(
    "pnpm",
    ["exec", "vite", "build", "--config", "gallery/vite.config.ts", "--logLevel", "warn"],
    {
      cwd: storybookDir,
      stdio: "inherit",
      env: { ...process.env, CONSTRUKT_KIT_STORYBOOK_USE_DESIGN_SYSTEM: "1" },
    },
  );
  if (result.status !== 0) throw new Error("The gallery build failed.");
}

function writeOnlyFile(ids: string[]): string {
  fs.mkdirSync(reportDir, { recursive: true });
  const file = path.join(reportDir, "only.json");
  fs.writeFileSync(file, JSON.stringify(ids));
  return file;
}

export async function runStories(options: RunOptions): Promise<number> {
  if (options.playwrightArgs.some((arg) => UPDATE_FLAGS.test(arg))) {
    process.stderr.write(
      "Snapshot updates are refused. Fix the code, or, for an intended change:\n" +
        "  screenshots: report the story ids to the owner, who runs `pnpm stories:accept`\n" +
        "  accessibility snapshots: `pnpm stories:aria <story ids>`\n",
    );
    return 2;
  }

  const ci = Boolean(process.env.CI);
  if (!(await writeStoryIds({ check: ci }))) {
    process.stderr.write(
      "packages/story-kit/src/story-ids.gen.ts is stale. Run `pnpm stories:ids` and commit it.\n",
    );
    return 2;
  }

  const env: Record<string, string> = { ...options.env };
  let only = options.only;
  if (options.changedSince !== undefined) {
    const affected = await affectedStories(options.changedSince);
    process.stdout.write(`${affected.reason}\n`);
    if (affected.ids !== "all") {
      if (affected.ids.length === 0) return 0;
      only = affected.ids;
    }
  }
  if (only) env.STORIES_ONLY = writeOnlyFile(only);

  const pixelsWanted = process.env.STORIES_PIXELS !== "off" && options.update !== "aria";
  if (pixelsWanted) {
    try {
      env.STORIES_BROWSER_WS = await startBrowser();
    } catch (error) {
      if (!(error instanceof DockerUnavailableError) || process.env.STORIES_PIXELS === "required")
        throw error;
      process.stdout.write(
        "\n  Functional run only: Docker is unavailable, so screenshots were not compared.\n" +
          "  Behaviour specs, accessibility checks and accessibility snapshots still ran.\n\n",
      );
    }
  }
  if (env.STORIES_BROWSER_WS) buildGallery();

  env.STORIES_GALLERY_PORT = String(await freePort());
  if (options.update === "missing") env.STORIES_UPDATE = "missing";
  if (options.update === "aria") env.STORIES_UPDATE = "aria";

  const result = spawnSync(
    process.execPath,
    [
      playwrightCli(),
      "test",
      "--config",
      path.join(storybookDir, "playwright.config.ts"),
      ...options.playwrightArgs,
    ],
    { cwd: repoRoot, stdio: "inherit", env: { ...process.env, ...env } },
  );
  return result.status ?? 1;
}
