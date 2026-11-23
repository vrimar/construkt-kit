#!/usr/bin/env node
// Publishes every non-private workspace package whose current version isn't yet on
// the registry, dependencies first, and creates an (unsigned, annotated) git tag for
// every package version that lacks one so `git push --follow-tags` ships them.
// Idempotent: re-running skips anything already on npm and only adds missing tags.

import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { git, gitOk } from "./lib.mjs";
import { packageTag, releasablePackages } from "./release-files.mjs";

const args = process.argv.slice(2);
const otpArgs = args.filter((arg) => arg.startsWith("--otp"));
const pushTags = args.includes("--push-tags");

// Provenance can only be attested from a supported CI environment.
const provenanceArgs = process.env.GITHUB_ACTIONS ? ["--provenance"] : [];

const publish = spawnSync(
  "pnpm",
  [
    "publish",
    "--recursive",
    "--access",
    "public",
    "--no-git-checks",
    ...provenanceArgs,
    ...otpArgs,
  ],
  { stdio: "inherit" },
);
if (publish.status !== 0) {
  console.error("\nPublish failed, so nothing was tagged. Re-run once fixed.");
  process.exit(publish.status ?? 1);
}

const tagged = [];
const untagged = [];

// Tags the version-bump commit, since HEAD may have moved on since that version was published.
function releaseCommit(dir, version) {
  const manifest = join(dir, "package.json");
  return git("log", "-1", "--format=%H", "-S", `"version": "${version}"`, "--", manifest) || "HEAD";
}

function tagRelease(tag, commit) {
  if (gitOk("rev-parse", "--quiet", "--verify", `refs/tags/${tag}`)) return;
  try {
    git("-c", "tag.gpgsign=false", "tag", "-a", tag, "-m", tag, commit);
    console.log(`tag    ${tag}`);
    tagged.push(tag);
  } catch (error) {
    console.error(`tag    ${tag} failed: ${error.stderr?.trim() || error.message}`);
    untagged.push(tag);
  }
}

for (const { name, version, path } of releasablePackages()) {
  tagRelease(packageTag(name, version), releaseCommit(path, version));
}

if (pushTags && tagged.length > 0) {
  git("push", "origin", ...tagged.map((tag) => `refs/tags/${tag}`));
  console.log(`\nPushed ${tagged.join(", ")}.`);
} else if (tagged.length > 0) {
  console.log("\nNext: git push --follow-tags");
}
if (untagged.length > 0) {
  console.error(`\nCould not tag ${untagged.join(", ")}; re-run to retry.`);
  process.exitCode = 1;
}
