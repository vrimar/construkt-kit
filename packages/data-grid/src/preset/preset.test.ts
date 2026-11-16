import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, test } from "vitest";

const packageDir = path.resolve(import.meta.dirname, "../..");
const CLASS_NAME = /\.(-?[_a-zA-Z][\w-]*)/g;

const classNames = (config: string) => {
  const dir = mkdtempSync(path.join(tmpdir(), "data-grid-css-"));
  const outfile = path.join(dir, "styles.css");
  try {
    execFileSync("pnpm", ["exec", "panda", "cssgen", "--config", config, "--outfile", outfile], {
      cwd: packageDir,
      stdio: "pipe",
    });
    return new Set(Array.from(readFileSync(outfile, "utf8").matchAll(CLASS_NAME), (m) => m[1]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("the grid preset adds its recipe without dropping any ui selector", () => {
  const uiOnly = classNames("test/panda.ui.config.ts");
  const withGrid = classNames("panda.config.ts");

  expect(withGrid).toContain("data-grid__cell");
  expect(uiOnly).toContain("button--size_2xl");
  expect([...uiOnly].filter((name) => !withGrid.has(name))).toEqual([]);
}, 60_000);
