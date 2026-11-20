#!/usr/bin/env node
import { accept } from "./accept.ts";
import { browserStatus, startBrowser, stopBrowser } from "./browser.ts";
import { writeStoryIds } from "./ids.ts";
import { PROJECTS, SWEEP_SPEC } from "./paths.ts";
import { runStories } from "./run.ts";

const USAGE = `Usage:
  story-kit test [--changed[=<ref>]] [playwright args]   run story tests (default ref: origin/main)
  story-kit aria <story id>... | --all                   rewrite accessibility snapshots
  story-kit accept <story id>... --reason "<intent>" [--project desktop|phone] [--from-ci <run id>] [--all-missing]
                                                         accept screenshot baselines the owner approved
  story-kit browser start|stop|status                    manage the pinned browser container
  story-kit ids [--check]                                regenerate the typed story id list`;

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
      if (!ok)
        process.stderr.write(
          "packages/story-kit/src/story-ids.gen.ts is stale. Run `pnpm stories:ids`.\n",
        );
      return ok ? 0 : 1;
    }
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
