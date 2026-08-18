#!/usr/bin/env node
// When @pandacss/eslint-plugin fails to load its config it logs "syncAction error" and
// every Panda rule then reports nothing — while oxlint still exits 0. This turns that
// silent hole into a failure. Piping is skipped on a TTY because oxlint writes its
// diagnostics to stderr and drops colours when that is not a terminal.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PLUGIN_FAILURE = "syncAction error";
const OXLINT = fileURLToPath(new URL("../node_modules/.bin/oxlint", import.meta.url));

const interactive = process.stderr.isTTY === true;

const child = spawn(OXLINT, process.argv.slice(2), {
  stdio: ["inherit", "inherit", interactive ? "inherit" : "pipe"],
});

let pluginFailed = false;

if (!interactive) {
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (chunk.includes(PLUGIN_FAILURE)) pluginFailed = true;
    process.stderr.write(chunk);
  });
}

child.on("error", (error) => {
  process.stderr.write(`lint: could not run ${OXLINT}\n       ${error.message}\n`);
  process.exit(1);
});

child.on("close", (code, signal) => {
  if (pluginFailed) {
    process.stderr.write(
      `\nlint: @pandacss/eslint-plugin failed to load its config, so its rules did not run.\n` +
        `      Lower --threads, or raise vm.overcommit_memory, then re-run.\n`,
    );
    process.exit(1);
  }
  process.exit(signal ? 1 : (code ?? 1));
});
