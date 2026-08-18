import path from "node:path";
import { fileURLToPath } from "node:url";

import baseConfig from "@construkt-kit/config/oxlint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  ...baseConfig,
  // Loads panda.config.ts by spawning esbuild; that fork fails with ENOMEM once oxlint's
  // peak RSS is high enough, after which every rule below silently reports nothing and
  // the run still exits 0. The root lint script caps --threads to keep RSS down and
  // greps stderr for the failure.
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
