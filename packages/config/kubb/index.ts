import { type UserConfig, defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { QueryKey } from "@kubb/plugin-react-query/components";
import { pluginTs } from "@kubb/plugin-ts";

import { deepMerge } from "../internal/merge";

export interface KubbConfigOptions {
  inputPath?: string;
  outputPath?: string;
  clientImportPath?: string;
  /** Merged over the generated config; arrays (notably `plugins`) replace rather than concat. */
  overrides?: Partial<UserConfig>;
}

export function createKubbConfig({
  inputPath = "./src/api/openapi.json",
  outputPath = "./src/api/gen",
  clientImportPath = "@/api/client",
  overrides = {},
}: KubbConfigOptions = {}) {
  const base = defineConfig({
    input: { path: inputPath },
    output: { path: outputPath, clean: true },
    plugins: [
      pluginOas({ generators: [] }),
      pluginTs({
        output: {
          path: "./dtos",
          banner(oas) {
            return `// version: ${oas.api.info.version}`;
          },
        },
      }),
      pluginClient({
        output: { path: "./calls" },
        importPath: clientImportPath,
        pathParamsType: "object",
      }),
      pluginReactQuery({
        client: { importPath: clientImportPath },
        output: { path: "./hooks" },
        group: { type: "path" },
        queryKey(props) {
          const keys = QueryKey.getTransformer(props);
          return ['"v5"', ...keys];
        },
        paramsType: "inline",
        pathParamsType: "object",
        suspense: false,
      }),
    ],
  });

  return deepMerge(base, overrides);
}
