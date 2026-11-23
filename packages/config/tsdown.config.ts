import { createTsdownConfig } from "./tsdown/index.ts";

export default createTsdownConfig({
  entry: {
    "vite/index": "vite/index.ts",
    "playwright/index": "playwright/index.ts",
    "kubb/index": "kubb/index.ts",
    "oxlint/index": "oxlint/index.ts",
    "oxfmt/index": "oxfmt/index.ts",
    "tsdown/index": "tsdown/index.ts",
    "vitest/index": "vitest/index.ts",
  },
});
