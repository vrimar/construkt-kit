import { defineConfig } from "oxfmt";

import { deepMerge } from "../internal/merge";

type OxfmtConfig = ReturnType<typeof defineConfig>;

const baseConfig = defineConfig({
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  singleAttributePerLine: true,
  printWidth: 100,
  tabWidth: 2,
  sortImports: true,
});

export function createOxfmtConfig(overrides: Partial<OxfmtConfig> = {}): OxfmtConfig {
  return deepMerge(baseConfig, overrides);
}

export type { OxfmtConfig };

export default baseConfig;
