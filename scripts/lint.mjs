#!/usr/bin/env node
// When @pandacss/eslint-plugin fails to load its config it logs "syncAction error" and
// every Panda rule then reports nothing — while oxlint still exits 0. This turns that
// silent hole into a failure. The load spawns esbuild, which hits ENOMEM once oxlint's
// peak RSS is high enough, so the first failure is retried single-threaded before it is
// treated as real. Piping is skipped on a TTY because oxlint writes its diagnostics to
// stderr and drops colours when that is not a terminal.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PLUGIN_FAILURE = "syncAction error";
const OXLINT = fileURLToPath(new URL("../node_modules/.bin/oxlint", import.meta.url));

const interactive = process.stderr.isTTY === true;
const args = process.argv.slice(2);

function runOxlint(oxlintArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(OXLINT, oxlintArgs, {
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

    child.on("error", reject);
    child.on("close", (code, signal) => {
      resolve({ pluginFailed, code: signal ? 1 : (code ?? 1) });
    });
  });
}

let result;
try {
  result = await runOxlint(args);
} catch (error) {
  process.stderr.write(`lint: could not run ${OXLINT}\n       ${error.message}\n`);
  process.exit(1);
}

if (result.pluginFailed && !args.includes("--threads=1")) {
  process.stderr.write("\nlint: Panda plugin config load failed; retrying single-threaded.\n");
  const retryArgs = [...args.filter((arg) => !arg.startsWith("--threads")), "--threads=1"];
  try {
    result = await runOxlint(retryArgs);
  } catch (error) {
    process.stderr.write(`lint: could not run ${OXLINT}\n       ${error.message}\n`);
    process.exit(1);
  }
}

if (result.pluginFailed) {
  process.stderr.write(
    `\nlint: @pandacss/eslint-plugin failed to load its config, so its rules did not run.\n` +
      `      Raise vm.overcommit_memory, then re-run.\n`,
  );
  process.exit(1);
}

process.exit(result.code);
