import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";

import { readBrowserImage } from "../browser-image.ts";
import { cacheDir, repoRoot, storyKitDir } from "../paths.ts";

interface BrowserState {
  name: string;
  port: number;
}

export class DockerUnavailableError extends Error {}

const stateFile = path.join(cacheDir, "browser.json");
const containerName = `story-kit-${crypto.createHash("sha1").update(repoRoot).digest("hex").slice(0, 10)}`;

function resolvePackageDir(name: string, from: string): string {
  return path.dirname(createRequire(from).resolve(`${name}/package.json`));
}

export function playwrightCoreDir(): string {
  const testDir = resolvePackageDir("@playwright/test", path.join(storyKitDir, "package.json"));
  const playwrightDir = resolvePackageDir("playwright", path.join(testDir, "package.json"));
  return fs.realpathSync(
    resolvePackageDir("playwright-core", path.join(playwrightDir, "package.json")),
  );
}

export function installedPlaywrightVersion(): string {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(playwrightCoreDir(), "package.json"), "utf8"),
  );
  return manifest.version as string;
}

function docker(args: string[]) {
  return spawnSync("docker", args, { encoding: "utf8" });
}

function dockerAvailable(): boolean {
  const result = docker(["version", "--format", "{{.Server.Version}}"]);
  return result.status === 0;
}

function isRunning(): boolean {
  const result = docker(["inspect", "--format", "{{.State.Running}}", containerName]);
  return result.status === 0 && result.stdout.trim() === "true";
}

function readState(): BrowserState | null {
  if (!fs.existsSync(stateFile)) return null;
  return JSON.parse(fs.readFileSync(stateFile, "utf8")) as BrowserState;
}

export function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

function canConnect(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

async function waitForPort(port: number, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canConnect(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`The browser container did not listen on port ${port} within ${timeoutMs}ms.`);
}

const wsEndpoint = (port: number) => `ws://127.0.0.1:${port}/`;

export async function startBrowser(): Promise<string> {
  if (!dockerAvailable()) {
    throw new DockerUnavailableError(
      "Docker is not available, so the pinned browser cannot start.",
    );
  }
  const image = readBrowserImage();
  const installed = installedPlaywrightVersion();
  if (installed !== image.playwright) {
    throw new Error(
      `@playwright/test resolves playwright-core ${installed}, but packages/story-kit/browser-image.json pins ${image.playwright}. ` +
        "Update the image tag and digest to the matching mcr.microsoft.com/playwright release; every baseline must then be re-accepted.",
    );
  }

  const state = readState();
  if (state && isRunning()) return wsEndpoint(state.port);

  docker(["rm", "-f", containerName]);
  const port = await freePort();
  const result = docker([
    "run",
    "--detach",
    "--rm",
    "--name",
    containerName,
    "--platform",
    image.platform,
    "--init",
    "--ipc=host",
    "--publish",
    `127.0.0.1:${port}:${port}`,
    "--volume",
    `${playwrightCoreDir()}:/opt/playwright-core:ro`,
    `${image.image}@${image.digest}`,
    "node",
    "/opt/playwright-core/cli.js",
    "run-server",
    "--port",
    String(port),
    "--host",
    "0.0.0.0",
  ]);
  if (result.status !== 0) {
    throw new Error(`docker run failed:\n${result.stderr}`);
  }
  await waitForPort(port, 60_000);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify({ name: containerName, port } satisfies BrowserState));
  return wsEndpoint(port);
}

export function stopBrowser() {
  docker(["rm", "-f", containerName]);
  fs.rmSync(stateFile, { force: true });
}

export function browserStatus(): string {
  const state = readState();
  if (!dockerAvailable()) return "docker unavailable";
  if (state && isRunning()) return `running ${containerName} at ${wsEndpoint(state.port)}`;
  return "stopped";
}
