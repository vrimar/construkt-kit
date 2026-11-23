import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { BEHAVIOUR_SPECS, STORY_PACKAGES, repoRoot } from "../paths.ts";

export interface AffectedStories {
  ids: string[] | "all";
  reason: string;
}

const RUN_EVERYTHING = [
  /^packages\/preset\//,
  /^packages\/story-kit\/(?!src\/(bin|vitest)\/|src\/report|src\/story-ids\.gen\.ts$|[^/]+\.md$|story-coverage-allow\.json$|oxlint-stories\.mjs$|tsconfig\.json$)/,
  /^apps\/storybook\/(?!__baselines__\/|\.stories-report\/)/,
  /^packages\/[^/]+\/(panda\.config\.ts|package\.json|postcss\.config\.\w+)$/,
  /^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/,
];

const SOURCE_EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];
const IMPORT_SPECIFIER =
  /(?<!["'\w])(?:import|export)\b[\s\S]{0,400}?\bfrom[ \t]*["']([^"'\n]+)["']|(?<!["'\w])import[ \t]*\(?[ \t]*["']([^"'\n]+)["']/g;
const STORY_ID_LITERAL = /["']([a-z0-9-]+--[a-z0-9-]+)["']/g;
const WORKSPACE_SCOPE = "@construkt-kit/";
const WORKSPACE_IMPORT = /^@construkt-kit\/([^/]+)/;
const PACKAGE_SOURCE = /^packages\/([^/]+)\/src\/(.+)$/;
const RUNTIME_DEPENDENCIES = ["dependencies", "peerDependencies", "optionalDependencies"] as const;

type Manifest = Partial<Record<(typeof RUNTIME_DEPENDENCIES)[number], Record<string, string>>>;

function git(args: string[]): string[] {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) return [];
  return result.stdout.split("\n").filter(Boolean);
}

export function changedFiles(base: string): string[] {
  const hasBase = git(["rev-parse", "--verify", "--quiet", base]).length > 0;
  return [
    ...new Set([
      ...(hasBase ? git(["diff", "--name-only", `${base}...HEAD`]) : []),
      ...git(["diff", "--name-only", "HEAD"]),
      ...git(["ls-files", "--others", "--exclude-standard"]),
    ]),
  ];
}

function resolveRelative(fromFile: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(path.join(repoRoot, fromFile)), specifier);
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = base + extension;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(repoRoot, candidate);
    }
  }
  return null;
}

interface Reach {
  files: Set<string>;
  packages: Set<string>;
}

function reachFrom(entry: string, cache: Map<string, Reach>): Reach {
  const cached = cache.get(entry);
  if (cached) return cached;
  const reach: Reach = { files: new Set(), packages: new Set() };
  const queue = [entry];
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (reach.files.has(file)) continue;
    reach.files.add(file);
    const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
    for (const match of text.matchAll(IMPORT_SPECIFIER)) {
      const specifier = match[1] ?? match[2];
      if (specifier.startsWith(".")) {
        const resolved = resolveRelative(file, specifier);
        if (resolved) queue.push(resolved);
      } else {
        const workspace = WORKSPACE_IMPORT.exec(specifier);
        if (workspace) reach.packages.add(workspace[1]);
      }
    }
  }
  cache.set(entry, reach);
  return reach;
}

function isPackageSource(file: string): string | null {
  const match = PACKAGE_SOURCE.exec(file);
  if (!match || /\.(stories|test|spec)\.tsx?$/.test(match[2])) return null;
  return match[1];
}

function workspaceDependencies(name: string): string[] {
  const file = path.join(repoRoot, "packages", name, "package.json");
  if (!fs.existsSync(file)) return [];
  const manifest = JSON.parse(fs.readFileSync(file, "utf8")) as Manifest;
  return RUNTIME_DEPENDENCIES.flatMap((field) => Object.keys(manifest[field] ?? {}))
    .filter((dependency) => dependency.startsWith(WORKSPACE_SCOPE))
    .map((dependency) => dependency.slice(WORKSPACE_SCOPE.length));
}

function runtimeDependents(): Map<string, Set<string>> {
  const dependents = new Map<string, Set<string>>();
  const queue: string[] = [...STORY_PACKAGES];
  for (let name = queue.pop(); name !== undefined; name = queue.pop()) {
    if (dependents.has(name)) continue;
    dependents.set(name, new Set());
    queue.push(...workspaceDependencies(name));
  }
  for (const name of dependents.keys()) {
    for (const dependency of workspaceDependencies(name)) dependents.get(dependency)?.add(name);
  }
  return dependents;
}

function changedPackages(changed: string[]): Set<string> {
  const dependents = runtimeDependents();
  const affected = new Set<string>();
  const queue = changed
    .map(isPackageSource)
    .filter((name): name is string => name !== null && dependents.has(name));
  for (let name = queue.pop(); name !== undefined; name = queue.pop()) {
    if (affected.has(name)) continue;
    affected.add(name);
    queue.push(...(dependents.get(name) ?? []));
  }
  return affected;
}

async function storyFiles(): Promise<Map<string, string[]>> {
  const { stories } = (await import(
    path.join(repoRoot, "packages/story-kit/src/story-ids.gen.ts")
  )) as {
    stories: Record<string, { file: string }>;
  };
  const byFile = new Map<string, string[]>();
  for (const [id, { file }] of Object.entries(stories)) {
    byFile.set(file, [...(byFile.get(file) ?? []), id]);
  }
  return byFile;
}

function storyIdsNamedIn(file: string, cache: Map<string, Reach>): string[] {
  const ids: string[] = [];
  for (const reached of reachFrom(file, cache).files) {
    const text = fs.readFileSync(path.join(repoRoot, reached), "utf8");
    for (const match of text.matchAll(STORY_ID_LITERAL)) ids.push(match[1]);
  }
  return ids;
}

export async function affectedStories(base: string): Promise<AffectedStories> {
  return affectedBy(changedFiles(base), `since ${base}`);
}

export async function affectedBy(changed: string[], since: string): Promise<AffectedStories> {
  const global = changed.find((file) => RUN_EVERYTHING.some((pattern) => pattern.test(file)));
  if (global) return { ids: "all", reason: `Running every story: ${global} changed.` };

  const cache = new Map<string, Reach>();
  const byFile = await storyFiles();
  const affected = new Set<string>();
  const existing = changed.filter((file) => fs.existsSync(path.join(repoRoot, file)));
  const packages = changedPackages(existing);
  const reachesChange = (entry: string) => {
    const reach = reachFrom(entry, cache);
    return (
      existing.some((changedFile) => reach.files.has(changedFile)) ||
      [...reach.packages].some((name) => packages.has(name))
    );
  };

  for (const [file, ids] of byFile) {
    if (reachesChange(file)) for (const id of ids) affected.add(id);
  }
  for (const spec of fs.globSync(BEHAVIOUR_SPECS, { cwd: repoRoot })) {
    if (reachesChange(spec)) for (const id of storyIdsNamedIn(spec, cache)) affected.add(id);
  }

  const known = new Set([...byFile.values()].flat());
  const ids = [...affected].filter((id) => known.has(id)).sort();
  return {
    ids,
    reason:
      ids.length === 0
        ? `No story is affected by the ${changed.length} changed file(s) ${since}.`
        : `Running ${ids.length} affected stories (${changed.length} changed file(s) ${since}).`,
  };
}
