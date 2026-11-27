import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const COMMIT = "\u0001";

const isShallowClone = (dir: string) =>
  spawnSync("git", ["rev-parse", "--is-shallow-repository"], {
    cwd: dir,
    encoding: "utf8",
  }).stdout?.trim() === "true";

/**
 * ISO date of the last commit touching each of `files` under `dir`, by absolute path; undefined
 * in a shallow clone, whose history can't date them.
 */
export const lastCommitDates = (dir: string, files: string[]) =>
  new Promise<Map<string, string> | undefined>((resolve) => {
    const wanted = new Set(files);
    const dates = new Map<string, string>();
    if (!wanted.size) return resolve(dates);
    if (isShallowClone(dir)) return resolve(undefined);

    const git = spawn(
      "git",
      ["log", `--format=${COMMIT}%cI`, "-z", "--name-only", "--relative", "--", "."],
      { cwd: dir, stdio: ["ignore", "pipe", "ignore"] },
    );
    let date = "";
    let rest = "";

    git.stdout.setEncoding("utf8");
    git.stdout.on("data", (chunk: string) => {
      const fields = (rest + chunk).split("\0");
      rest = fields.pop() ?? "";
      for (const field of fields) {
        if (field.startsWith(COMMIT)) {
          date = field.slice(COMMIT.length);
          continue;
        }
        const file = path.join(dir, field.replace(/^\n/, ""));
        if (!wanted.has(file) || dates.has(file)) continue;
        dates.set(file, date);
        if (dates.size === wanted.size) git.kill();
      }
    });
    git.on("error", () => resolve(new Map()));
    git.on("close", (code) =>
      resolve(code === 0 || dates.size === wanted.size ? dates : new Map()),
    );
  });
