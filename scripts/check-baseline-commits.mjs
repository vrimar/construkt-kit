#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PNG = /^apps\/storybook\/__baselines__\/.+\.png$/;
const ZERO_SHA = /^0+$/;

function git(args, options = {}) {
  return spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", ...options });
}

function commitRange() {
  const base = process.env.BASE_SHA;
  if (base && !ZERO_SHA.test(base) && git(["cat-file", "-e", `${base}^{commit}`]).status === 0) {
    return `${base}..HEAD`;
  }
  const mergeBase = git(["merge-base", "origin/main", "HEAD"]).stdout.trim();
  return mergeBase ? `${mergeBase}..HEAD` : "HEAD";
}

const range = commitRange();
const commits = git(["rev-list", "--no-merges", range]).stdout.split("\n").filter(Boolean);
const baselineCommits = commits
  .map((sha) => ({
    sha,
    files: git(["diff-tree", "--no-commit-id", "--name-only", "-r", sha])
      .stdout.split("\n")
      .filter(Boolean),
  }))
  .filter(({ files }) => files.some((file) => BASELINE_PNG.test(file)));

if (baselineCommits.length === 0) {
  console.log(`No screenshot baseline changed in ${range}.`);
  process.exit(0);
}

const problems = [];
for (const { sha, files } of baselineCommits) {
  const subject = git(["log", "-1", "--format=%h %s", sha]).stdout.trim();
  const others = files.filter((file) => !BASELINE_PNG.test(file));
  if (others.length > 0) {
    problems.push(
      `${subject}: a baseline commit may change only baselines, but it also changes ${others.join(", ")}.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} baseline commit problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`${baselineCommits.length} baseline commit(s) in ${range} change only baselines.`);
