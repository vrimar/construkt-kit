#!/usr/bin/env node
// attw's exit code ignores --profile for resolutionOption-keyed problems, so the profile is applied here.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const IGNORED_KINDS = new Set(["node10", "node16-cjs"]);
const IGNORED_OPTIONS = new Set(["node10"]);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "attw-"));
const reportPath = path.join(tmpDir, "report.json");

let raw;
try {
  // attw exits before a piped stdout drains; a file descriptor receives the whole report.
  const fd = fs.openSync(reportPath, "w");
  const result = spawnSync(
    "attw",
    ["--pack", ".", "--profile", "esm-only", "--format", "json", ...process.argv.slice(2)],
    { stdio: ["ignore", fd, "inherit"], shell: process.platform === "win32" },
  );
  fs.closeSync(fd);
  if (result.error) throw result.error;
  raw = fs.readFileSync(reportPath, "utf8");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const { analysis } = JSON.parse(raw);
if (!analysis.types) {
  console.log(`attw: ${analysis.packageName} ships no types.`);
  process.exit(0);
}

const failures = analysis.problems.filter((problem) =>
  "resolutionKind" in problem
    ? !IGNORED_KINDS.has(problem.resolutionKind)
    : !IGNORED_OPTIONS.has(problem.resolutionOption),
);

if (failures.length) {
  console.error(`attw: ${failures.length} problem(s) in esm-only resolutions:\n`);
  for (const problem of failures) {
    const where = problem.resolutionKind ?? problem.resolutionOption ?? "";
    const target = problem.entrypoint ?? problem.fileName ?? "";
    const detail = problem.moduleSpecifier ? ` → ${problem.moduleSpecifier}` : "";
    console.error(`  ${problem.kind} [${where}] ${target}${detail}`);
  }
  console.error(`\nRun \`attw --pack . --profile esm-only\` for the full table.`);
  process.exit(1);
}

console.log(
  `attw: ${analysis.packageName}@${analysis.packageVersion} clean for esm-only resolutions.`,
);
