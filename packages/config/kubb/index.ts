import { adapterOas } from "@kubb/adapter-oas";
import { pluginFetch } from "@kubb/plugin-fetch";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";
import type { UserConfig } from "kubb";
import { defineConfig } from "kubb/config";

import { deepMerge } from "../internal/merge";

export interface KubbConfigOptions {
  inputPath?: string;
  outputPath?: string;
  /**
   * Merged over the generated config; arrays (notably `plugins`) and `adapter` replace rather
   * than merge.
   */
  overrides?: Partial<UserConfig>;
}

export function createKubbConfig({
  inputPath = "./src/api/openapi.json",
  outputPath = "./src/api/gen",
  overrides = {},
}: KubbConfigOptions = {}): UserConfig {
  const base: UserConfig = {
    input: inputPath,
    output: { path: outputPath, clean: true, barrel: { type: "named" } },
    adapter: adapterOas({ integerType: "number" }),
    plugins: [
      pluginTs({
        output: {
          path: "./dtos",
          barrel: { type: "named" },
          banner(meta) {
            return `// version: ${meta.version}`;
          },
        },
      }),
      pluginFetch({ output: { path: "./calls", barrel: { type: "named" } } }),
      pluginReactQuery({
        output: { path: "./hooks", barrel: { type: "named", nested: true } },
        group: { type: "path" },
        hooks: true,
      }),
    ],
  };

  const merged = deepMerge(base, overrides);
  if (overrides.adapter) merged.adapter = overrides.adapter;

  // Runs after the merge; an `overrides.plugins` array would otherwise drop the barrel plugin.
  return defineConfig(merged);
}
