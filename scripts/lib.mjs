import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  }).trim();

export const git = (...args) => run("git", args);

export const gitOk = (...args) =>
  spawnSync("git", args, { cwd: repoRoot, stdio: "ignore" }).status === 0;

export function workspaces() {
  return JSON.parse(run("pnpm", ["ls", "--recursive", "--depth", "-1", "--json"]))
    .filter((project) => path.resolve(project.path) !== repoRoot)
    .map((project) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(project.path, "package.json"), "utf8"));
      return {
        name: manifest.name,
        version: manifest.version,
        path: project.path,
        dir: path.relative(repoRoot, project.path),
        manifest,
      };
    });
}

export function reportProblems(what, problems, advice = "") {
  if (problems.length === 0) return false;
  console.error(`\n${problems.length} ${what}:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(advice && `\n${advice}\n`);
  return true;
}
