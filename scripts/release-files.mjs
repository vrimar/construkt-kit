import { workspaces } from "./lib.mjs";

const RELEASE_FILE = /^packages\/[^/]+\/(package\.json|CHANGELOG\.md)$/;
const VERSION_LINE = /^[+-]\s*"version": /;

export const releasablePackages = () => workspaces().filter(({ manifest }) => !manifest.private);

export const packageTag = (name, version) => `${name}@${version}`;

export function isReleaseChange(file, diff) {
  if (!RELEASE_FILE.test(file)) return false;
  if (!file.endsWith("package.json")) return true;
  return diff
    .split("\n")
    .filter((line) => /^[+-]/.test(line) && !/^(\+\+\+|---)/.test(line))
    .every((line) => VERSION_LINE.test(line));
}
