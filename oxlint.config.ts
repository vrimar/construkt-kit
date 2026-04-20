import { defineConfig } from "oxlint";

import baseConfig from "./packages/config/oxlint/index.config.ts";

export default defineConfig({
  ...baseConfig,
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
