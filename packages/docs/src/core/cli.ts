import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { register } from "tsx/esm/api";

import { buildDocs } from "./build";
import type { DocsConfig } from "./types";
import { watchPath } from "./watch";

const USAGE = "Usage: construkt-kit-docs [--config docs.config.ts] [--dev]";
const DEBOUNCE_MS = 120;

interface DevChildMessage {
  watch: string[];
}

const loadConfig = async (configPath: string) => {
  const unregister = register();
  try {
    const module = (await import(pathToFileURL(configPath).href)) as {
      default?: DocsConfig | { default?: DocsConfig };
    };
    const config =
      module.default && "default" in module.default ? module.default.default : module.default;
    if (!config || !Array.isArray((config as DocsConfig).roots))
      throw new Error(`${configPath} must default-export defineDocsConfig({ … })`);
    return config as DocsConfig;
  } finally {
    await unregister();
  }
};

const report = (lines: string[], prefix: string) => {
  for (const line of lines) process.stderr.write(`docs: ${prefix}${line}\n`);
};

const watchTargetsOf = (config: DocsConfig, configPath: string) => {
  const cwd = path.dirname(configPath);
  return [
    ...config.roots.map((root) => path.resolve(cwd, root.contentDir)),
    ...(config.watch ?? []).map((entry) => path.resolve(cwd, entry)),
  ];
};

const sendToParent = (message: DevChildMessage) =>
  new Promise<void>((resolve) => {
    if (!process.send) return resolve();
    process.send(message, () => {
      process.disconnect?.();
      resolve();
    });
  });

const buildOnce = async (configPath: string, dev: boolean) => {
  const config = await loadConfig(configPath);
  if (dev) await sendToParent({ watch: watchTargetsOf(config, configPath) });
  const result = await buildDocs(config, { cwd: path.dirname(configPath), dev });

  report(result.warnings, "warning: ");
  report(result.errors, "");
  if (!result.errors.length)
    process.stdout.write(`docs: ${result.pages} pages, ${result.sections} search sections\n`);

  return result.errors.length === 0;
};

const rebuildInChild = (
  binPath: string,
  configPath: string,
  onMessage: (message: DevChildMessage) => void,
) =>
  new Promise<void>((resolve) => {
    const child = spawn(process.execPath, [binPath, "--config", configPath, "--dev-child"], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    });
    child.on("message", (message) => onMessage(message as DevChildMessage));
    child.on("exit", () => resolve());
  });

const reportWatchError = (error: Error) =>
  process.stderr.write(`docs: stopped watching a path: ${error.message}\n`);

const watchAndRebuild = async (binPath: string, configPath: string) => {
  const watchers = new Map<string, () => void>();
  const watchOnly = (targets: string[]) => {
    const wanted = new Set([configPath, ...targets]);
    for (const [target, close] of watchers) {
      if (wanted.has(target)) continue;
      close();
      watchers.delete(target);
    }
    for (const target of wanted)
      if (!watchers.has(target))
        watchers.set(target, watchPath(target, schedule, reportWatchError));
  };

  let running = false;
  let pending = false;
  let timer: NodeJS.Timeout | undefined;

  const run = async () => {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    do {
      pending = false;
      await rebuildInChild(binPath, configPath, (message) => watchOnly(message.watch));
    } while (pending);
    running = false;
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(), DEBOUNCE_MS);
  };

  watchOnly([]);
  process.on("SIGINT", () => {
    for (const close of watchers.values()) close();
    process.exit(0);
  });

  await run();
};

export const main = async (binPath: string, argv: string[]) => {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        config: { type: "string", default: "docs.config.ts" },
        dev: { type: "boolean", default: false },
        "dev-child": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    }));
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n${USAGE}\n`);
    return 2;
  }

  if (values.help) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }

  const configPath = path.resolve(process.cwd(), values.config);

  if (values.dev) {
    await watchAndRebuild(binPath, configPath);
    return undefined;
  }

  return (await buildOnce(configPath, values["dev-child"])) ? 0 : 1;
};
