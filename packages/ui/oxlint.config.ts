import baseConfig from "@b3/config/oxlint";

export default {
  ...baseConfig,
  jsPlugins: ["@pandacss/eslint-plugin"],
  settings: {
    "@pandacss/configPath": "./panda.config.ts",
  },
  rules: {
    ...baseConfig.rules,
    "@pandacss/file-not-included": "error",
    "@pandacss/no-debug": "warn",
    "@pandacss/no-deprecated-tokens": "warn",
    "@pandacss/no-dynamic-styling": "warn",
    "@pandacss/no-hardcoded-color": "warn",
    "@pandacss/no-invalid-nesting": "error",
    "@pandacss/no-invalid-token-paths": "error",
    "@pandacss/no-property-renaming": "warn",
    "@pandacss/no-unsafe-token-fn-usage": "warn",
  },
};