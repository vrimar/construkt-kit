import path from "node:path";
import { fileURLToPath } from "node:url";

import baseConfig from "@b3/config/oxlint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  ...baseConfig,
  jsPlugins: ["@pandacss/eslint-plugin"],
  settings: {
    "@pandacss/configPath": path.resolve(__dirname, "panda.config.ts"),
  },
  rules: {
    ...baseConfig.rules,
    "@pandacss/no-debug": "error",
    "@pandacss/no-deprecated-tokens": "error",
    "@pandacss/no-dynamic-styling": "off",
    "@pandacss/no-hardcoded-color": "error",
    "@pandacss/no-invalid-nesting": "error",
    "@pandacss/no-invalid-token-paths": "error",
    "@pandacss/no-property-renaming": "error",
    "@pandacss/no-unsafe-token-fn-usage": "error",
  },
};
