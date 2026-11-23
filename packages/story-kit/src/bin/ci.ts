import { spawnSync } from "node:child_process";

import { BASELINE_DIR_RELATIVE, repoRoot } from "../paths.ts";

const ZERO_SHA = /^0+$/;
const BASELINE_PNG = new RegExp(`^${BASELINE_DIR_RELATIVE}/.+\\.png$`);
const GUARDRAIL_FILES = [
  /^packages\/story-kit\//,
  /^apps\/storybook\/(tests|gallery)\//,
  /^packages\/config\/oxlint\/construkt\.mjs$/,
  /^oxlint\.config\.ts$/,
  /^\.github\//,
  /^turbo\.json$/,
];

function git(args: string[]): { ok: boolean; out: string } {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return { ok: result.status === 0, out: result.stdout };
}

const lines = (text: string) => text.split("\n").filter(Boolean);

function ciCommitRange(): string {
  const base = process.env.BASE_SHA;
  if (base && !ZERO_SHA.test(base) && git(["cat-file", "-e", `${base}^{commit}`]).ok) {
    return `${base}..HEAD`;
  }
  const mergeBase = git(["merge-base", "origin/main", "HEAD"]).out.trim();
  return mergeBase ? `${mergeBase}..HEAD` : "HEAD~1..HEAD";
}

export function checkBaselineCommits(): number {
  const range = ciCommitRange();
  const baselineCommits = lines(git(["rev-list", "--no-merges", range]).out)
    .map((sha) => ({
      sha,
      files: lines(git(["diff-tree", "--no-commit-id", "--name-only", "-r", sha]).out),
    }))
    .filter(({ files }) => files.some((file) => BASELINE_PNG.test(file)));

  if (baselineCommits.length === 0) {
    process.stdout.write(`No screenshot baseline changed in ${range}.\n`);
    return 0;
  }

  const problems = baselineCommits.flatMap(({ sha, files }) => {
    const others = files.filter((file) => !BASELINE_PNG.test(file));
    if (others.length === 0) return [];
    const subject = git(["log", "-1", "--format=%h %s", sha]).out.trim();
    return [
      `${subject}: a baseline commit may change only baselines, but it also changes ${others.join(", ")}.`,
    ];
  });
  if (problems.length > 0) {
    process.stderr.write(`\n${problems.length} baseline commit problem(s):\n\n`);
    for (const problem of problems) process.stderr.write(`  ${problem}\n`);
    return 1;
  }

  process.stdout.write(
    `${baselineCommits.length} baseline commit(s) in ${range} change only baselines.\n`,
  );
  return 0;
}

interface DiffLine {
  file: string;
  to?: string;
  text: string;
}

export function guardrailSummary(): string {
  const range = ciCommitRange();
  const changes = lines(git(["diff", "--name-status", range]).out).map((line) => {
    const [status, ...paths] = line.split("\t");
    return { status: status[0], file: paths.at(-1) ?? "" };
  });

  const added: DiffLine[] = [];
  const removed: DiffLine[] = [];
  const headerPath = (line: string) => line.slice(4).replace(/\t$/, "");
  let from = "";
  let to = "";
  let inHunk = false;
  for (const line of git(["diff", "-U0", "--no-prefix", range]).out.split("\n")) {
    if (line.startsWith("diff --git ")) inHunk = false;
    else if (line.startsWith("@@")) inHunk = true;
    else if (!inHunk) {
      if (line.startsWith("--- ")) from = headerPath(line);
      else if (line.startsWith("+++ ")) to = headerPath(line);
    } else if (line.startsWith("+")) added.push({ file: to, text: line.slice(1).trim() });
    else if (line.startsWith("-")) removed.push({ file: from, to, text: line.slice(1).trim() });
  }

  const isStory = ({ file }: DiffLine) => file.endsWith(".stories.tsx");
  const storyName = ({ text }: DiffLine) => /^export const (\w+) = meta\.story/.exec(text)?.[1];
  const keptStories = new Set(
    added.filter(isStory).map((line) => `${line.file}:${storyName(line)}`),
  );
  const baselinePrefix = `${BASELINE_DIR_RELATIVE}/`;
  const sections = [
    {
      title: "Baseline changes",
      items: changes
        .filter(({ file }) => file.startsWith(baselinePrefix))
        .map(({ status, file }) => `${status} ${file.slice(baselinePrefix.length)}`),
    },
    {
      title: "New viewport tags (a story skipped on one device)",
      items: added
        .filter((line) => isStory(line) && /"(phone|desktop)-only"/.test(line.text))
        .map((line) => `${line.file}: ${line.text}`),
    },
    {
      title: "Accessibility rules disabled",
      items: added
        .filter((line) => isStory(line) && /enabled:\s*false/.test(line.text))
        .map((line) => `${line.file}: ${line.text}`),
    },
    {
      title: "Lint disables",
      items: added
        .filter((line) => /(oxlint|eslint)-disable/.test(line.text))
        .map((line) => `${line.file}: ${line.text}`),
    },
    {
      title: "Deleted stories",
      items: removed
        .filter(
          (line) =>
            isStory(line) && storyName(line) && !keptStories.has(`${line.to}:${storyName(line)}`),
        )
        .map((line) => `${line.file}: export const ${storyName(line)}`),
    },
    {
      title: "Edits to the test harness and its guards",
      items: changes
        .filter(({ file }) => GUARDRAIL_FILES.some((pattern) => pattern.test(file)))
        .map(({ status, file }) => `${status} ${file}`),
    },
  ];

  const out = [`## Story test guardrails (${range})`, ""];
  for (const { title, items } of sections) {
    out.push(`### ${title}: ${items.length === 0 ? "none" : items.length}`);
    for (const item of items.slice(0, 50)) out.push(`- \`${item}\``);
    if (items.length > 50) out.push(`- … ${items.length - 50} more`);
    out.push("");
  }
  return out.join("\n");
}
