import { spawn, spawnSync } from "node:child_process";

const mode = process.argv[2];
const pnpmExecPath = process.env.npm_execpath;

if (!pnpmExecPath) {
  throw new Error("npm_execpath is not set");
}

if (mode === "build") {
  process.env.CONSTRUCT_KIT_STORYBOOK_USE_BUILDINFO = "1";

  const typecheckResult = runPnpmSync(["exec", "tsgo", "--noEmit"]);

  if (typecheckResult !== 0) {
    process.exit(typecheckResult);
  }

  process.exit(runPnpmSync(["exec", "storybook", "build"]));
} else if (mode === "dev") {
  const typecheckProcess = runPnpm(["exec", "tsgo", "--noEmit", "--watch", "--pretty"]);
  const storybookProcess = runPnpm(["exec", "storybook", "dev", "-p", "6006"]);

  let shuttingDown = false;

  const shutdown = (signal = "SIGTERM") => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (!typecheckProcess.killed) {
      typecheckProcess.kill(signal);
    }

    if (!storybookProcess.killed) {
      storybookProcess.kill(signal);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  typecheckProcess.on("exit", (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });

  storybookProcess.on("exit", (code, signal) => {
    shutdown(signal ?? "SIGTERM");
    process.exit(code ?? 0);
  });
} else {
  throw new Error(`Unsupported Storybook mode: ${mode ?? "<missing>"}`);
}

function runPnpm(args) {
  return spawn(process.execPath, [pnpmExecPath, ...args], {
    stdio: "inherit",
    env: process.env,
  });
}

function runPnpmSync(args) {
  const result = spawnSync(process.execPath, [pnpmExecPath, ...args], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}
