import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

import { REQUIREMENT } from "./fixtures";

/** One requirement on one project: it must pass there, or stay a `fixme` with a reason. */
export interface CoverageCell {
  id: string;
  project: string;
  expect: "pass" | "fixme";
}

export interface CoverageOptions {
  cells: readonly CoverageCell[];
  /**
   * Fails a cell no test proves. Leave it off for a run of a few files or a grep, where most cells
   * are deliberately not run.
   */
  requireEveryCell?: boolean;
  /** Writes every cell's outcome here as JSON. */
  outputFile?: string;
}

type Outcome = "passed" | "failed" | "fixme" | "skipped";

interface Seen {
  outcome: Outcome;
  reason?: string;
}

const key = (id: string, project: string) => `${id}\u0000${project}`;

const outcomeOf = (test: TestCase, result: TestResult): Seen => {
  if (result.status === "passed") return { outcome: "passed" };
  if (result.status !== "skipped") return { outcome: "failed" };
  const fixme = test.annotations.find((a) => a.type === "fixme");
  if (fixme) return { outcome: "fixme", reason: fixme.description };
  return {
    outcome: "skipped",
    reason: test.annotations.find((a) => a.type === "skip")?.description,
  };
};

/**
 * Checks a run against a requirement inventory: every test names its requirement through the
 * `requirement` annotation, every cell that ran passed (or stayed a reasoned `fixme`), and, with
 * `requireEveryCell`, every cell ran. Fails the run on any gap.
 */
export class CoverageReporter implements Reporter {
  private readonly cells: Map<string, CoverageCell>;
  private readonly seen = new Map<string, Seen>();
  private readonly problems: string[] = [];

  constructor(private readonly options: CoverageOptions) {
    this.cells = new Map(options.cells.map((cell) => [key(cell.id, cell.project), cell]));
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    this.seen.clear();
    this.problems.length = 0;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.retry < test.retries && result.status !== "passed" && result.status !== "skipped")
      return;
    const project = test.parent.project()?.name ?? "";
    const ids = test.annotations.filter((a) => a.type === REQUIREMENT).map((a) => a.description);
    if (ids.length === 0) {
      this.problems.push(`${test.titlePath().join(" › ")} [${project}] names no requirement`);
      return;
    }
    const seen = outcomeOf(test, result);
    for (const id of ids) {
      if (!id) continue;
      const cell = this.cells.get(key(id, project));
      if (!cell) {
        if (seen.outcome !== "skipped")
          this.problems.push(`${id} [${project}] ran, but the inventory doesn't list it there`);
        continue;
      }
      this.seen.set(key(id, project), seen);
    }
  }

  async onEnd(result: FullResult): Promise<{ status?: FullResult["status"] } | undefined> {
    const rows: Array<CoverageCell & Partial<Seen>> = [];
    for (const [k, cell] of this.cells) {
      const seen = this.seen.get(k);
      rows.push({ ...cell, ...seen });
      const where = `${cell.id} [${cell.project}]`;
      if (!seen) {
        if (this.options.requireEveryCell) this.problems.push(`${where} has no test`);
      } else if (cell.expect === "pass" && seen.outcome !== "passed") {
        this.problems.push(`${where} ${seen.outcome}${seen.reason ? `: ${seen.reason}` : ""}`);
      } else if (cell.expect === "fixme" && (seen.outcome !== "fixme" || !seen.reason)) {
        this.problems.push(`${where} should be a fixme with a reason, but ${seen.outcome}`);
      }
    }
    if (this.options.outputFile) {
      mkdirSync(dirname(this.options.outputFile), { recursive: true });
      writeFileSync(
        this.options.outputFile,
        JSON.stringify({ cells: rows, problems: this.problems }, null, 2),
      );
    }

    const proven = rows.filter((row) => row.outcome === "passed").length;
    const lines = [
      `Coverage: ${proven}/${rows.length} cells pass; ${this.problems.length} problem(s).`,
    ];
    process.stdout.write(`\n${[...lines, ...this.problems.map((p) => `  ${p}`)].join("\n")}\n`);
    return this.problems.length && result.status === "passed" ? { status: "failed" } : undefined;
  }

  printsToStdio() {
    return false;
  }
}

export default CoverageReporter;
