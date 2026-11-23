import { type ChildProcess, spawn } from "node:child_process";

export interface ServerOptions {
  command: string;
  args?: readonly string[];
  cwd?: string;
  /** Added to the runner's environment. */
  env?: Record<string, string>;
  /** Polled until it answers over HTTP. */
  url: string;
  timeoutMs?: number;
}

export interface RunningServer {
  url: string;
  stop(): Promise<void>;
}

const OUTPUT_KEPT = 4_000;

const stopped = (child: ChildProcess) =>
  new Promise<void>((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) resolve();
    else child.once("exit", () => resolve());
  });

/**
 * Starts a server for one worker, such as a `vite preview` on the worker's own port, and resolves
 * once `url` answers. Playwright's `webServer` starts one per run; this is for one per worker.
 */
export async function startServer({
  command,
  args = [],
  cwd,
  env,
  url,
  timeoutMs = 60_000,
}: ServerOptions): Promise<RunningServer> {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let output = "";
  const keep = (chunk: Buffer) => {
    output = (output + chunk.toString()).slice(-OUTPUT_KEPT);
  };
  child.stdout?.on("data", keep);
  child.stderr?.on("data", keep);

  const stop = async () => {
    if (child.pid && child.exitCode === null) process.kill(-child.pid, "SIGTERM");
    await stopped(child);
  };

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (child.exitCode !== null)
      throw new Error(
        `${command} exited with ${child.exitCode} before ${url} answered:\n${output}`,
      );
    try {
      await fetch(url, { signal: AbortSignal.timeout(2_000) });
      return { url, stop };
    } catch {
      if (Date.now() > deadline) {
        await stop();
        throw new Error(`${url} didn't answer within ${timeoutMs}ms:\n${output}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}
