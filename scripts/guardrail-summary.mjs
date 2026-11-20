#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZERO_SHA = /^0+$/;
const GUARDRAIL_FILES = [
  /^packages\/story-kit\//,
  /^apps\/storybook\/(playwright\.config\.ts|tests\/|gallery\/)/,
  /^packages\/config\/oxlint\/construkt\.mjs$/,
  /^oxlint\.config\.ts$/,
  /^scripts\/(check-stories|check-baseline-commits|guardrail-summary)\.mjs$/,
  /^scripts\/story-coverage-allow\.json$/,
  /^\.github\/workflows\//,
  /^turbo\.json$/,
];

function git(args) {
  return spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 })
    .stdout;
}

function commitRange() {
  const base = process.env.BASE_SHA;
  if (
    base &&
    !ZERO_SHA.test(base) &&
    spawnSync("git", ["cat-file", "-e", `${base}^{commit}`], { cwd: repoRoot }).status === 0
  ) {
    return `${base}..HEAD`;
  }
  const mergeBase = git(["merge-base", "origin/main", "HEAD"]).trim();
  return mergeBase ? `${mergeBase}..HEAD` : "HEAD~1..HEAD";
}

const range = commitRange();
const changes = git(["diff", "--name-status", range])
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [status, ...paths] = line.split("\t");
    return { status: status[0], file: paths.at(-1) };
  });

const added = [];
const removed = [];
const headerPath = (line) => line.slice(4).replace(/\t$/, "");
let from = "";
let to = "";
let inHunk = false;
for (const line of git(["diff", "-U0", "--no-prefix", range]).split("\n")) {
  if (line.startsWith("diff --git ")) inHunk = false;
  else if (line.startsWith("@@")) inHunk = true;
  else if (!inHunk) {
    if (line.startsWith("--- ")) from = headerPath(line);
    else if (line.startsWith("+++ ")) to = headerPath(line);
  } else if (line.startsWith("+")) added.push({ file: to, text: line.slice(1).trim() });
  else if (line.startsWith("-")) removed.push({ file: from, to, text: line.slice(1).trim() });
}

const isStory = ({ file }) => file.endsWith(".stories.tsx");
const storyName = ({ text }) => /^export const (\w+) = meta\.story/.exec(text)?.[1];
const keptStories = new Set(added.filter(isStory).map((line) => `${line.file}:${storyName(line)}`));
const sections = [
  {
    title: "Baseline changes",
    items: changes
      .filter(({ file }) => file.startsWith("apps/storybook/__baselines__/"))
      .map(({ status, file }) => `${status} ${file.replace("apps/storybook/__baselines__/", "")}`),
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

const lines = [`## Story test guardrails (${range})`, ""];
for (const { title, items } of sections) {
  lines.push(`### ${title}: ${items.length === 0 ? "none" : items.length}`);
  for (const item of items.slice(0, 50)) lines.push(`- \`${item}\``);
  if (items.length > 50) lines.push(`- … ${items.length - 50} more`);
  lines.push("");
}
console.log(lines.join("\n"));
