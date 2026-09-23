import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type UserConfig, defineConfig } from "tsdown";

import { deepMerge } from "../internal/merge";

export interface TsdownConfigOptions extends UserConfig {
  /** Packages tsdown must import rather than inline into the bundle. */
  neverBundle?: string[];
}

interface EmittedChunk {
  type: string;
  outDir: string;
  moduleIds?: string[];
}

const INLINED_PACKAGE_ROOT = /^(.*[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?[^\\/]+)[\\/]/;
const LEGAL_FILE = /^(licen[cs]e|notice)(\.|$)/i;

function writeThirdPartyLicenses(chunks: readonly EmittedChunk[]) {
  const roots = new Set<string>();
  for (const chunk of chunks) {
    for (const id of chunk.moduleIds ?? []) {
      const root = INLINED_PACKAGE_ROOT.exec(id)?.[1];
      if (root) roots.add(root);
    }
  }
  if (roots.size === 0) return;

  const sections = [...roots]
    .map((root) => {
      const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
      const legal = readdirSync(root)
        .filter((file) => LEGAL_FILE.test(file))
        .sort()
        .map((file) => readFileSync(path.join(root, file), "utf8").trim());
      const body = legal.length > 0 ? legal.join("\n\n") : `Licensed under ${pkg.license}.`;
      return {
        id: `${pkg.name}@${pkg.version}`,
        text: `## ${pkg.name}@${pkg.version} (${pkg.license})\n\n${body}\n`,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((section) => section.text);

  writeFileSync(
    path.join(chunks[0].outDir, "THIRD_PARTY_LICENSES.md"),
    `# Third-party licenses\n\nThis package bundles the following dependencies.\n\n${sections.join("\n")}`,
  );
}

export function createTsdownConfig({
  neverBundle,
  ...overrides
}: TsdownConfigOptions = {}): UserConfig {
  const base: UserConfig = {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    hooks: {
      "build:done": ({ chunks }) => writeThirdPartyLicenses(chunks),
    },
    ...(neverBundle ? { deps: { neverBundle } } : {}),
  };

  return defineConfig(deepMerge(base, overrides));
}

export type { UserConfig as TsdownConfig };
