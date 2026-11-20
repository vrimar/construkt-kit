#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { isReleaseChange } from "./release-files.mjs";

const planOnly = process.argv.includes("--plan");
const unknown = process.argv.slice(2).filter((arg) => arg !== "--plan");
if (unknown.length > 0) {
  console.error(`Unknown argument ${unknown[0]}. Usage: pnpm release:prepare [--plan]`);
  process.exit(2);
}

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { cwd: root, encoding: "utf8", ...options }).trim();
const git = (...args) => run("git", args, { stdio: ["ignore", "pipe", "pipe"] });
const gitOk = (...args) => spawnSync("git", args, { cwd: root, stdio: "ignore" }).status === 0;

const problems = [];
const warnings = [];

function parseVersion(text) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(text);
  if (!match) throw new Error(`Unsupported version ${text}`);
  return match.slice(1).map(Number);
}

function compareVersions(a, b) {
  const [x, y] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function bump(version, level) {
  const [major, minor, patch] = parseVersion(version);
  if (level === "major") return `${major + 1}.0.0`;
  if (level === "minor") return `${major}.${minor + 1}.0`;
  if (level === "patch") return `${major}.${minor}.${patch + 1}`;
  return version;
}

const versionValue = (text) => {
  const [a = 0, b = 0, c = 0] = text.split(".").map(Number);
  return a * 1e6 + b * 1e3 + c;
};

function comparators(range) {
  return range
    .trim()
    .split(/\s+/)
    .map((comparator) => {
      const match = /^(>=|<=|>|<|=|\^|~)?(\d+(?:\.\d+){0,2})$/.exec(comparator);
      if (!match) throw new Error(`Unsupported range ${range}`);
      const [, op = "=", base] = match;
      return { op, base };
    });
}

function satisfies(version, range) {
  const [major, minor, patch] = parseVersion(version);
  const value = major * 1e6 + minor * 1e3 + patch;
  return comparators(range).every(({ op, base }) => {
    const [a = 0, b = 0, c = 0] = base.split(".").map(Number);
    const low = versionValue(base);
    if (op === ">=") return value >= low;
    if (op === ">") return value > low;
    if (op === "<=") return value <= low;
    if (op === "<") return value < low;
    if (op === "=") return value === low;
    if (op === "~") return value >= low && value < versionValue(`${a}.${b + 1}.0`);
    const high =
      a > 0
        ? versionValue(`${a + 1}.0.0`)
        : b > 0
          ? versionValue(`0.${b + 1}.0`)
          : versionValue(`0.0.${c + 1}`);
    return value >= low && value < high;
  });
}

function floorOf(range) {
  const lows = comparators(range).filter(({ op }) => op !== "<" && op !== "<=");
  return lows.reduce(
    (floor, { base }) => (versionValue(base) > versionValue(floor) ? base : floor),
    "0",
  );
}

function raisedPeerFloors(before, after) {
  return Object.entries(after.peerDependencies ?? {})
    .filter(
      ([name, range]) => name.startsWith("@construkt-kit/") && !range.startsWith("workspace:"),
    )
    .map(([name, range]) => ({ name, from: before.peerDependencies?.[name], to: range }))
    .filter(
      ({ from, to }) =>
        from === undefined || versionValue(floorOf(to)) > versionValue(floorOf(from)),
    );
}

const SUBJECT = /^(\w+)(?:\(([^)]*)\))?(!)?: (.+)$/;
const SECTIONS = { breaking: "Breaking", feat: "Features", fix: "Fixes", other: "Other" };
const OTHER_TYPES = new Set(["perf", "refactor", "revert"]);
const DEPENDENCY_FIELDS = {
  dependencies: "",
  peerDependencies: "peer ",
  optionalDependencies: "optional ",
};
const COUNTED = {
  breaking: ["breaking", "breaking"],
  feat: ["feature", "features"],
  fix: ["fix", "fixes"],
  other: ["other", "other"],
};
const PUBLISHED_FIELDS = [
  "license",
  "peerDependenciesMeta",
  "exports",
  "bin",
  "files",
  "main",
  "module",
  "types",
  "sideEffects",
  "engines",
];

function publishedChanges(before, after) {
  const changes = [];
  for (const [field, kind] of Object.entries(DEPENDENCY_FIELDS)) {
    const [old, now] = [before[field] ?? {}, after[field] ?? {}];
    for (const name of [...new Set([...Object.keys(old), ...Object.keys(now)])].sort()) {
      if (!(name in now)) changes.push(`Drop ${kind}dependency ${name}`);
      else if (!(name in old)) changes.push(`Add ${kind}dependency ${name} ${now[name]}`);
      else if (old[name] !== now[name]) {
        const label = kind && `${kind[0].toUpperCase()}${kind.slice(1)}`;
        changes.push(`${label}${name} ${old[name]} → ${now[name]}`);
      }
    }
  }
  for (const field of PUBLISHED_FIELDS) {
    if (JSON.stringify(before[field]) !== JSON.stringify(after[field])) {
      changes.push(`Change \`${field}\` in package.json`);
    }
  }
  return changes;
}

function shippedPaths(dir, manifest) {
  const include = ["src", "package.json", ...(manifest.files ?? []).filter((f) => f !== "dist")];
  const exclude = ["*.test.*", "*.spec.*", "*.stories.*", "*.cases.*"];
  return [
    ...include.map((entry) => `${dir}/${entry}`),
    ...exclude.map((glob) => `:(exclude,glob)${dir}/**/${glob}`),
  ];
}

function commitsSince(base, paths) {
  const range = base ? `${base}..HEAD` : "HEAD";
  const log = git("log", "--format=%h%x1f%s%x1f%b%x1e", range, "--", ...paths);
  return log
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, subject, body = ""] = record.split("\x1f");
      const match = SUBJECT.exec(subject);
      const type = match?.[1] ?? "other";
      const breaking = Boolean(match?.[3]) || /^BREAKING[ -]CHANGE:/m.test(body);
      const text = match ? match[4] : subject;
      const section = breaking
        ? "breaking"
        : type === "feat" || type === "fix"
          ? type
          : OTHER_TYPES.has(type)
            ? "other"
            : null;
      return { hash, type, breaking, section, text: text[0].toUpperCase() + text.slice(1) };
    });
}

function levelFor(commits, version) {
  const major = parseVersion(version)[0];
  if (commits.some((commit) => commit.breaking)) return major === 0 ? "minor" : "major";
  if (commits.some((commit) => commit.section === "feat")) return "minor";
  return commits.some((commit) => commit.section) ? "patch" : "none";
}

function latestTag(name) {
  const tags = git("tag", "-l", `${name}@*`)
    .split("\n")
    .filter(Boolean)
    .filter((tag) => /^\d+\.\d+\.\d+$/.test(tag.slice(name.length + 1)))
    .filter((tag) => gitOk("merge-base", "--is-ancestor", tag, "HEAD"));
  tags.sort((a, b) => compareVersions(a.slice(name.length + 1), b.slice(name.length + 1)));
  return tags.at(-1) ?? null;
}

const projects = JSON.parse(run("pnpm", ["ls", "--recursive", "--depth", "-1", "--json"]))
  .filter((project) => project.path.startsWith(path.join(root, "packages") + path.sep))
  .map((project) => {
    const dir = path.relative(root, project.path);
    const manifest = JSON.parse(fs.readFileSync(path.join(project.path, "package.json"), "utf8"));
    return { name: project.name, dir, manifest, version: manifest.version };
  });

const releases = [];
for (const project of projects.filter((p) => !p.manifest.private)) {
  const tag = latestTag(project.name);
  const base = tag ? tag.slice(project.name.length + 1) : null;
  const commits = commitsSince(tag, shippedPaths(project.dir, project.manifest));
  let level = levelFor(commits, base ?? project.version);
  const released = tag ? JSON.parse(git("show", `${tag}:${project.dir}/package.json`)) : null;
  const manifestChanges = released ? publishedChanges(released, project.manifest) : [];
  const raisedPeers = released ? raisedPeerFloors(released, project.manifest) : [];
  if (level === "none" && manifestChanges.length > 0) level = "patch";
  let next = null;
  if (!base) {
    next = project.version;
    warnings.push(`${project.name} has no release tag yet; its first release is ${next}.`);
  } else if (compareVersions(project.version, base) < 0) {
    problems.push(`${project.name} is at ${project.version}, below its last release ${base}.`);
  } else if (compareVersions(project.version, base) > 0) {
    const needed = bump(base, level);
    if (compareVersions(project.version, needed) < 0) {
      problems.push(
        `${project.name} is at ${project.version}, but its changes since ${base} need ${needed}.`,
      );
    }
    next = project.version;
  } else if (level !== "none") {
    next = bump(base, level);
  }
  releases.push({ ...project, tag, base, commits, level, manifestChanges, raisedPeers, next });
}

const planned = releases.filter((release) => release.next);
const versionOf = (name) =>
  planned.find((release) => release.name === name)?.next ??
  projects.find((project) => project.name === name)?.version;

for (const release of releases) {
  const { manifest } = release;
  const ranges = {
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies,
  };
  for (const [dep, range] of Object.entries(ranges)) {
    if (!dep.startsWith("@construkt-kit/") || range.startsWith("workspace:")) continue;
    const version = versionOf(dep);
    if (version && !satisfies(version, range)) {
      problems.push(`${release.name} needs ${dep} ${range}, which excludes ${dep} ${version}.`);
    }
  }
  const breaking = release.commits.some((commit) => commit.breaking);
  if (!release.next || !release.base || (!breaking && release.raisedPeers.length === 0)) continue;
  if (!breaking) {
    const raised = release.raisedPeers
      .map(({ name, from, to }) => `${name} ${from ?? "(none)"} → ${to}`)
      .join(", ");
    problems.push(
      `${release.name} raises its peer floor (${raised}) without a breaking commit: mark the commit that raises it breaking ("!" after its type, or a "BREAKING CHANGE:" footer).`,
    );
  }
  const [major, minor] = parseVersion(release.base);
  const from = major === 0 ? `${major}.${minor}` : `${major}`;
  const readme = path.join(root, release.dir, "README.md");
  const notes = new RegExp(`^#{2,6} Upgrading from ${from.replace(".", "\\.")}\\s*$`, "m");
  if (!fs.existsSync(readme) || !notes.test(fs.readFileSync(readme, "utf8"))) {
    problems.push(
      `${release.name} ${release.next} breaks ${release.base}: add "## Upgrading from ${from}" to ${release.dir}/README.md.`,
    );
  }
}

const short = (name) => name.replace("@construkt-kit/", "");
console.log("Release plan");
for (const release of releases) {
  const counts = Object.keys(SECTIONS)
    .map((key) => [key, release.commits.filter((commit) => commit.section === key).length])
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${count} ${count === 1 ? COUNTED[key][0] : COUNTED[key][1]}`);
  if (release.manifestChanges.length > 0) {
    const count = release.manifestChanges.length;
    counts.push(`${count} package.json change${count === 1 ? "" : "s"}`);
  }
  const change = release.next
    ? `${release.base ?? "—"} → ${release.next}`.padEnd(18) + counts.join(", ")
    : `${release.version}`.padEnd(18) + "no release: nothing shipped changed";
  console.log(`  ${short(release.name).padEnd(10)} ${change}`);
}

let unpushed = 0;

function preflight() {
  const issues = [];
  const branch = git("branch", "--show-current");
  if (branch !== "main")
    issues.push(`Releases are cut from main; this is ${branch || "a detached HEAD"}.`);
  if (gitOk("fetch", "--quiet", "--tags", "origin", "main")) {
    const behind = Number(git("rev-list", "--count", "HEAD..origin/main"));
    if (behind > 0) issues.push(`main is ${behind} commits behind origin/main; pull first.`);
    unpushed = Number(git("rev-list", "--count", "origin/main..HEAD"));
  } else {
    issues.push("Could not fetch origin.");
  }
  const status = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  for (const line of status.split("\n").filter(Boolean)) {
    const file = line.slice(3);
    if (!isReleaseChange(file, git("diff", "-U0", "HEAD", "--", file))) {
      issues.push(`Uncommitted change outside a release: ${file}`);
    }
  }
  return issues;
}

const preflightIssues = preflight();
if (planOnly) {
  warnings.push(...preflightIssues);
} else if (preflightIssues.length > 0) {
  console.error("\nCannot prepare a release:");
  for (const issue of preflightIssues) console.error(`  - ${issue}`);
  process.exit(1);
}

const today = new Date().toLocaleDateString("sv-SE");

function changelogSection(release) {
  const lines = [`## ${release.next} — ${today}`, ""];
  if (!release.base) return [...lines, "First release.", ""].join("\n");
  for (const [key, title] of Object.entries(SECTIONS)) {
    const commits = release.commits.filter((commit) => commit.section === key);
    if (commits.length === 0) continue;
    lines.push(`### ${title}`, "", ...commits.map((c) => `- ${c.text} (\`${c.hash}\`)`), "");
  }
  if (release.manifestChanges.length > 0) {
    lines.push("### Package", "", ...release.manifestChanges.map((change) => `- ${change}`), "");
  }
  return lines.join("\n");
}

function writeChangelog(release) {
  const file = path.join(root, release.dir, "CHANGELOG.md");
  const section = changelogSection(release);
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : `# ${release.name}\n\n`;
  const heading = new RegExp(`^## ${release.next.replaceAll(".", "\\.")} — .*$`, "m");
  const start = current.search(heading);
  let updated;
  if (start === -1) {
    const firstSection = current.search(/^## /m);
    const at = firstSection === -1 ? current.length : firstSection;
    updated = `${current.slice(0, at).trimEnd()}\n\n${section}\n${current.slice(at)}`;
  } else {
    const rest = current.slice(start + 3).search(/^## /m);
    const end = rest === -1 ? current.length : start + 3 + rest;
    updated = `${current.slice(0, start)}${section}\n${current.slice(end)}`;
  }
  fs.writeFileSync(file, `${updated.trimEnd()}\n`);
}

function writeVersion(release) {
  const file = path.join(root, release.dir, "package.json");
  const text = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, text.replace(/("version":\s*")[^"]+(")/, `$1${release.next}$2`));
}

if (planOnly) {
  for (const warning of warnings) console.log(`  ! ${warning}`);
  report();
  console.log("\nPlan only: nothing written and no gate run. `pnpm release:prepare` applies it.");
  process.exit(problems.length > 0 ? 1 : 0);
}

for (const release of planned) {
  writeVersion(release);
  writeChangelog(release);
}
if (planned.length > 0) console.log("\nWrote versions and changelogs.");

const GATES = [
  {
    label: "Lint, typecheck, unit and browser tests",
    args: ["turbo", "run", "//#lint", "typecheck", "test", "test:browser"],
  },
  { label: "Story coverage", args: ["check:stories"] },
  { label: "Build and package checks", args: ["release:check"] },
  { label: "Story tests with pixels", args: ["test:stories"], env: { STORIES_PIXELS: "required" } },
];
const logDir = path.join(root, "node_modules/.cache/release-prepare");
fs.mkdirSync(logDir, { recursive: true });

console.log("\nGates");
for (const { label, args, env } of GATES) {
  const log = path.join(logDir, `${label.toLowerCase().replaceAll(/[^a-z]+/g, "-")}.log`);
  const started = Date.now();
  if (process.stdout.isTTY) process.stdout.write(`  … ${label}`);
  const out = fs.openSync(log, "w");
  const result = spawnSync("pnpm", args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ["ignore", out, out],
  });
  fs.closeSync(out);
  const seconds = Math.round((Date.now() - started) / 1000);
  const ok = result.status === 0;
  const line = `  ${ok ? "✓" : "✗"} ${label} (${seconds}s)\n`;
  process.stdout.write(process.stdout.isTTY ? `\r\x1b[2K${line}` : line);
  if (ok) continue;
  if (label.startsWith("Story tests")) problems.push(storyProblem(log, started));
  else problems.push(`${label} failed: see ${path.relative(root, log)}.`);
}

function storyProblem(log, started) {
  const file = path.join(root, "apps/storybook/.stories-report/report.json");
  const stories = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  if (!stories || Date.parse(stories.finishedAt) < started) {
    return `Story tests failed before reporting: see ${path.relative(root, log)}.`;
  }
  const kinds = new Map();
  for (const failure of stories.failures) {
    for (const kind of failure.kinds) kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
  }
  const summary = [...kinds].map(([kind, count]) => `${count} ${kind}`).join(", ");
  return `${stories.failed} story failures (${summary}): review apps/storybook/.stories-report/report.html, accept the intended ones and fix the rest.`;
}

report();

function nextTag() {
  const date = new Date().toLocaleDateString("sv-SE");
  const taken = git("tag", "-l", `release-${date}.*`)
    .split("\n")
    .filter(Boolean)
    .map((tag) => Number(tag.split(".").at(-1)));
  return `release-${date}.${Math.max(0, ...taken) + 1}`;
}

function report() {
  if (problems.length > 0) {
    console.log("\nLeft before release");
    for (const problem of problems) console.log(`  - ${problem}`);
    if (!planOnly) console.log("\nFix these, then run `pnpm release:prepare` again.");
    process.exitCode = 1;
    return;
  }
  if (planOnly) return;
  if (planned.length === 0) {
    console.log("\nNothing to release.");
    return;
  }
  const files = planned.flatMap((r) => [`${r.dir}/package.json`, `${r.dir}/CHANGELOG.md`]);
  const message = `chore: release ${planned.map((r) => `${short(r.name)} ${r.next}`).join(", ")}`;
  const tag = nextTag();
  console.log("\nReady. Commit, tag and push; the release waits for CI:");
  console.log(`  git add -- ${files.join(" ")}`);
  console.log(`  git commit -m "${message}"`);
  console.log(`  git tag ${tag}`);
  console.log(`  git push --atomic origin main ${tag}`);
  if (unpushed > 0) {
    console.log(
      `\nmain has ${unpushed} unpushed commit(s), so the release waits for this push's full CI run.` +
        "\nPush main and let CI pass before `pnpm release:prepare` to publish without that wait.",
    );
  }
}
