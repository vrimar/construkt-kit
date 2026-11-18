import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ACCEPTABLE } from "../report-html.ts";
import type { StoryFailure, StoryReport } from "../reporter.ts";
import { BASELINE_DIR_RELATIVE, PROJECTS, baselineDir, reportDir, repoRoot } from "./paths.ts";
import { runStories } from "./run.ts";

interface Target {
  storyId: string;
  project: string;
  actual?: string;
}

interface AcceptArgs {
  ids: string[];
  projects: string[];
  reason: string;
  fromCi?: string;
  allMissing: boolean;
}

function parseArgs(argv: string[]): AcceptArgs {
  const args: AcceptArgs = { ids: [], projects: [], reason: "", allMissing: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--reason") args.reason = argv[++index] ?? "";
    else if (arg === "--project") args.projects.push(argv[++index] ?? "");
    else if (arg === "--from-ci") args.fromCi = argv[++index];
    else if (arg === "--all-missing") args.allMissing = true;
    else if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}.`);
    else args.ids.push(arg);
  }
  if (args.projects.length === 0) args.projects = [...PROJECTS];
  return args;
}

function baselineFile(target: Target) {
  return path.join(baselineDir, target.project, `${target.storyId}.png`);
}

function downloadCiReport(runId: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "story-kit-ci-"));
  const result = spawnSync(
    "gh",
    ["run", "download", runId, "--name", "stories-report", "--dir", dir],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );
  if (result.status !== 0)
    throw new Error(`Could not download the stories-report artifact of run ${runId}.`);
  return dir;
}

function readReport(dir: string): StoryReport {
  const file = path.join(dir, "report.json");
  if (!fs.existsSync(file))
    throw new Error(`No story report at ${file}. Run \`pnpm test:stories\` first.`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as StoryReport;
}

function selectTargets(report: StoryReport, args: AcceptArgs, sourceDir: string): Target[] {
  if (report.mode !== "pixels") {
    throw new Error(
      "The last run compared no screenshots. Run `pnpm test:stories` with Docker available first.",
    );
  }
  const failures = report.failures.filter(
    (failure): failure is StoryFailure & { storyId: string } =>
      failure.storyId != null && args.projects.includes(failure.project),
  );
  const toTarget = (failure: StoryFailure & { storyId: string }): Target => ({
    storyId: failure.storyId,
    project: failure.project,
    actual: failure.actual ? path.join(sourceDir, failure.actual) : undefined,
  });
  if (args.allMissing) {
    const missing = failures.filter((failure) => failure.kinds.includes("missing-baseline"));
    const blocked = missing.filter((failure) =>
      failure.kinds.some((kind) => !ACCEPTABLE.has(kind)),
    );
    for (const failure of blocked) {
      process.stdout.write(
        `Skipped ${failure.storyId} (${failure.project}): it also failed with ${failure.kinds.filter((kind) => !ACCEPTABLE.has(kind)).join(", ")}.\n`,
      );
    }
    return missing.filter((failure) => !blocked.includes(failure)).map(toTarget);
  }
  const chosen = args.ids.flatMap((id) => {
    const matches = failures.filter((failure) => failure.storyId === id);
    if (matches.length === 0)
      throw new Error(`The last run recorded no failure for ${id} on ${args.projects.join(", ")}.`);
    return matches;
  });

  return chosen.map((failure) => {
    const refused = failure.kinds.filter((kind) => !ACCEPTABLE.has(kind));
    if (refused.length > 0) {
      throw new Error(
        `${failure.storyId} (${failure.project}) failed with ${refused.join(", ")}; only a plain screenshot change can be accepted. ` +
          (refused.includes("unstable")
            ? "Make the story deterministic first."
            : "Fix those failures first."),
      );
    }
    return toTarget(failure);
  });
}

function commit(targets: Target[], reason: string, key: string) {
  const paths = targets.map((target) => path.relative(repoRoot, baselineFile(target)));
  const add = spawnSync("git", ["add", "--", ...paths], { cwd: repoRoot, stdio: "inherit" });
  if (add.status !== 0) throw new Error("git add failed.");
  const stories = targets.map((target) => `${target.storyId} (${target.project})`).join(", ");
  const message = `test(stories): accept ${targets.length} baseline${targets.length === 1 ? "" : "s"}\n\nVisual-change: ${reason}\nStories: ${stories}\n`;
  const result = spawnSync(
    "git",
    [
      "-c",
      "gpg.format=ssh",
      "-c",
      `user.signingkey=${key}`,
      "commit",
      "--gpg-sign",
      "--file=-",
      "--",
      ...paths,
    ],
    { cwd: repoRoot, input: message, stdio: ["pipe", "inherit", "inherit"] },
  );
  if (result.status !== 0)
    throw new Error("git commit failed; the new baselines are staged but not committed.");
}

export async function accept(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  const key = process.env.STORIES_BASELINE_KEY;
  if (!key) {
    throw new Error(
      "Set STORIES_BASELINE_KEY to the private key that signs baselines (see packages/story-kit/README.md).",
    );
  }
  if (!args.reason.trim()) throw new Error('Say what changed and why with --reason "<intent>".');
  if (!args.allMissing && args.ids.length === 0)
    throw new Error("Name the stories to accept, or pass --all-missing.");

  const sourceDir = args.fromCi ? downloadCiReport(args.fromCi) : reportDir;
  const targets = selectTargets(readReport(sourceDir), args, sourceDir);
  if (targets.length === 0) {
    process.stdout.write("Nothing to accept.\n");
    return 0;
  }

  if (args.fromCi) {
    for (const target of targets) {
      if (!target.actual || !fs.existsSync(target.actual)) {
        throw new Error(
          `The CI report has no actual screenshot for ${target.storyId} (${target.project}).`,
        );
      }
      fs.mkdirSync(path.dirname(baselineFile(target)), { recursive: true });
      fs.copyFileSync(target.actual, baselineFile(target));
    }
  } else {
    for (const target of targets) fs.rmSync(baselineFile(target), { force: true });
    const ids = [...new Set(targets.map((target) => target.storyId))];
    const projectArgs = [...new Set(targets.map((target) => target.project))].flatMap((project) => [
      "--project",
      project,
    ]);
    if ((await runStories({ playwrightArgs: projectArgs, only: ids, update: "missing" })) !== 0) {
      throw new Error(
        "Capturing the new baselines failed; see the run above. Nothing was committed.",
      );
    }
    if ((await runStories({ playwrightArgs: projectArgs, only: ids })) !== 0) {
      throw new Error(
        "The new baselines did not reproduce on a second run. Nothing was committed.",
      );
    }
  }

  commit(targets, args.reason.trim(), key);
  process.stdout.write(`Committed ${targets.length} baseline(s) under ${BASELINE_DIR_RELATIVE}.\n`);
  return 0;
}
