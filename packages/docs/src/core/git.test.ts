import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "vitest";

import { lastCommitDates } from "./git";

let repo: string | undefined;

afterEach(async () => {
  if (repo) await rm(repo, { recursive: true, force: true });
});

test("each file under a folder of a repo gets the date of the last commit that touched it", async () => {
  repo = await mkdtemp(path.join(tmpdir(), "docs-git-"));
  const content = path.join(repo, "content");
  await mkdir(path.join(content, "guide"), { recursive: true });
  const git = (date: string, ...args: string[]) =>
    execFileSync(
      "git",
      ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args],
      {
        cwd: repo,
        env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
      },
    );
  const a = path.join(content, "a.mdx");
  const b = path.join(content, "guide", "b.mdx");

  git("2026-01-01T00:00:00Z", "init", "-q");
  await writeFile(a, "A.\n");
  await writeFile(b, "B.\n");
  git("2026-01-01T00:00:00Z", "add", ".");
  git("2026-01-01T00:00:00Z", "commit", "-q", "-m", "one");
  await writeFile(b, "B, again.\n");
  git("2026-02-01T00:00:00Z", "commit", "-q", "-am", "two");

  const dates = await lastCommitDates(content, [a, b]);

  expect(Object.fromEntries(dates ?? [])).toEqual({
    [a]: "2026-01-01T00:00:00Z",
    [b]: "2026-02-01T00:00:00Z",
  });
});
