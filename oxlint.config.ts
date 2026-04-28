import { defineConfig } from "oxlint";

import baseConfig from "@construkt-kit/config/oxlint";

export default defineConfig({
  ...baseConfig,
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
