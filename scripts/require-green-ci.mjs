#!/usr/bin/env node
import { setTimeout as sleep } from "node:timers/promises";

import { git, gitOk, run } from "./lib.mjs";
import { isReleaseChange } from "./release-files.mjs";

const POLL_MS = 30_000;
const START_GRACE_MS = 5 * 60_000;
const TIMEOUT_MS = 50 * 60_000;

const short = (sha) => sha.slice(0, 7);

const sha = process.env.GITHUB_SHA || git("rev-parse", "HEAD");
const repoArgs = process.env.GITHUB_REPOSITORY ? ["--repo", process.env.GITHUB_REPOSITORY] : [];

function fail(message) {
  console.error(process.env.GITHUB_ACTIONS ? `::error::${message}` : message);
  process.exit(1);
}

function releaseParent() {
  if (!gitOk("rev-parse", "--verify", "--quiet", `${sha}^`)) return null;
  const parent = git("rev-parse", `${sha}^`);
  const files = git("diff", "--no-renames", "--name-only", parent, sha).split("\n").filter(Boolean);
  const releaseOnly = files.every((file) =>
    isReleaseChange(file, git("diff", "-U0", parent, sha, "--", file)),
  );
  return releaseOnly ? parent : null;
}

function latestRun(commit) {
  const [latest] = JSON.parse(
    run("gh", [
      "run",
      "list",
      ...repoArgs,
      "--workflow",
      "ci.yml",
      "--commit",
      commit,
      "--limit",
      "1",
      "--json",
      "status,conclusion,url",
    ]),
  );
  return latest ?? null;
}

function describe({ commit, ci }) {
  if (!ci) return `${short(commit)}: no CI run`;
  const state = ci.status === "completed" ? ci.conclusion : ci.status;
  return `${short(commit)}: ${state} (${ci.url})`;
}

const parent = releaseParent();
const commits = parent ? [sha, parent] : [sha];
if (parent) {
  console.log(
    `${short(sha)} changes only versions and changelogs, so green CI on ${short(parent)} also counts.`,
  );
}

const started = Date.now();
for (;;) {
  const runs = commits.map((commit) => ({ commit, ci: latestRun(commit) }));
  const green = runs.find(({ ci }) => ci?.status === "completed" && ci.conclusion === "success");
  if (green) {
    console.log(`CI passed: ${describe(green)}`);
    process.exit(0);
  }

  const elapsed = Date.now() - started;
  const running = runs.some(({ ci }) => ci && ci.status !== "completed");
  const starting = runs.some(({ ci }) => !ci) && elapsed < START_GRACE_MS;
  const states = runs.map(describe).join("; ");
  if (!running && !starting) {
    fail(`CI has not passed (${states}). Fix main, then tag a commit whose CI is green.`);
  }
  if (elapsed > TIMEOUT_MS)
    fail(`Gave up waiting for CI after ${TIMEOUT_MS / 60_000} min (${states}).`);

  console.log(`Waiting for CI: ${states}`);
  await sleep(POLL_MS);
}
