#!/usr/bin/env node
import { PROJECTS } from "../devices.ts";
import { SWEEP_SPEC } from "../paths.ts";
import { accept } from "./accept.ts";
import { browserStatus, startBrowser, stopBrowser } from "./browser.ts";
import { checkBaselineCommits, guardrailSummary } from "./ci.ts";
import { checkStoryCoverage } from "./coverage.ts";
import { STALE_IDS_MESSAGE, writeStoryIds } from "./ids.ts";
import { runStories } from "./run.ts";
import { reportSummary } from "./summary.ts";

const USAGE = `Usage:
  story-kit test [--changed[=<ref>]] [playwright args]   run story tests (default ref: origin/main)
  story-kit aria <story id>... | --all                   rewrite accessibility snapshots
  story-kit accept <story id>... --reason "<intent>" [--project desktop|phone] [--from-ci <run id>] [--all-missing]
                                                         accept screenshot baselines the owner approved
  story-kit browser start|stop|status                    manage the pinned browser container
  story-kit ids [--check]                                regenerate the typed story id list
  story-kit check                                        story coverage of exports, sheet overlays and baselines
  story-kit summary [--since <time>]                     summarise the last report's failures; exit 1 if none since
  story-kit baseline-commits                             fail a commit that changes baselines and anything else
  story-kit guardrails                                   Markdown summary of guardrail edits for the CI run`;

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case "test": {
      const changed = rest.find((arg) => arg === "--changed" || arg.startsWith("--changed="));
      return runStories({
        playwrightArgs: rest.filter((arg) => arg !== changed),
        changedSince: changed ? (changed.split("=")[1] ?? "origin/main") : undefined,
      });
    }
    case "aria": {
      const all = rest.includes("--all");
      const ids = rest.filter((arg) => !arg.startsWith("--"));
      if (!all && ids.length === 0) {
        process.stderr.write(
          "Name the stories whose accessibility snapshots changed, or pass --all.\n",
        );
        return 2;
      }
      return runStories({
        playwrightArgs: [SWEEP_SPEC, ...PROJECTS.map((project) => `--project=${project}`)],
        only: all ? undefined : ids,
        update: "aria",
      });
    }
    case "accept":
      return accept(rest);
    case "browser": {
      const [action] = rest;
      if (action === "start") process.stdout.write(`${await startBrowser()}\n`);
      else if (action === "stop") stopBrowser();
      else process.stdout.write(`${browserStatus()}\n`);
      return 0;
    }
    case "ids": {
      const check = rest.includes("--check");
      const ok = await writeStoryIds({ check });
      if (!ok) process.stderr.write(`${STALE_IDS_MESSAGE}\n`);
      return ok ? 0 : 1;
    }
    case "check":
      return checkStoryCoverage();
    case "summary": {
      const at = rest.indexOf("--since");
      const since = at === -1 ? undefined : Date.parse(rest[at + 1] ?? "");
      if (Number.isNaN(since)) throw new Error("--since takes a time, e.g. 2026-11-20T09:00:00Z.");
      const summary = reportSummary(since);
      if (summary === null) return 1;
      process.stdout.write(`${summary}\n`);
      return 0;
    }
    case "baseline-commits":
      return checkBaselineCommits();
    case "guardrails":
      process.stdout.write(`${guardrailSummary()}\n`);
      return 0;
    default:
      process.stdout.write(`${USAGE}\n`);
      return command === undefined || command === "help" ? 0 : 2;
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  },
);
