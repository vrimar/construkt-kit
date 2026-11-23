import fs from "node:fs";
import path from "node:path";

import type { FullResult } from "@playwright/test/reporter";

import { reportDir } from "./paths.ts";

export type FailureKind =
  | "visual"
  | "dimension"
  | "missing-baseline"
  | "unstable"
  | "a11y"
  | "aria"
  | "spec";

export interface StoryFailure {
  storyId: string | null;
  test: string;
  file: string;
  exportName: string | null;
  project: string;
  kinds: FailureKind[];
  messages: string[];
  pixels: number | null;
  bbox: [number, number, number, number] | null;
  image: string | null;
  actual: string | null;
  rerun: string;
}

export interface StoryReport {
  mode: "pixels" | "functional";
  finishedAt: string;
  status: FullResult["status"];
  passed: number;
  failed: number;
  skipped: number;
  failures: StoryFailure[];
}

/** The failure kinds `stories:accept` may replace a baseline for. */
export const ACCEPTABLE: ReadonlySet<FailureKind> = new Set([
  "visual",
  "dimension",
  "missing-baseline",
]);

export const KIND_ADVICE: Record<FailureKind, string> = {
  visual:
    "Pixels changed. Open the image (reference | actual | diff). Fix the code, or if the change is intended, give the owner the story id and reason to accept.",
  dimension:
    "The page changed size. Compare the reference and actual screenshots; fix the layout or hand the change to the owner.",
  "missing-baseline": "No baseline yet. New stories need the owner to accept a first baseline.",
  unstable:
    "Two consecutive screenshots differed. Make the story deterministic (animation, timer, random data); never accept.",
  a11y: "axe found violations. Fix the markup; disable a rule on the story only for a confirmed false positive, with the rule id.",
  aria: "The accessibility tree changed. Fix the code, or if intended run `pnpm stories:aria <story id>` and commit the snapshot.",
  spec: "A behaviour spec failed. Read the assertion; the spec names the wrong change it catches.",
};

/** The report a run wrote into `dir`, or `null` when there is none. */
export function readReport(dir: string = reportDir): StoryReport | null {
  const file = path.join(dir, "report.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as StoryReport;
}
