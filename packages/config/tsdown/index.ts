import { type UserConfig, defineConfig } from "tsdown";

import { deepMerge } from "../internal/merge";

export interface TsdownConfigOptions extends UserConfig {
  /** Packages tsdown must import rather than inline into the bundle. */
  neverBundle?: string[];
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
    ...(neverBundle ? { deps: { neverBundle } } : {}),
  };

  return defineConfig(deepMerge(base, overrides));
}

export type { UserConfig as TsdownConfig };
