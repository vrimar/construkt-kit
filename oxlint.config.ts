import { createOxlintConfig } from "@construkt-kit/config/oxlint";

export default createOxlintConfig({
  ignorePatterns: [
    "**/dist/**",
    "**/storybook-static/**",
    "**/styled-system/**",
    "**/test/gen/**",
  ],
  overrides: [
    {
      files: ["**/bin/**", "**/scripts/**"],
      rules: { "no-console": "off" },
    },
    {
      files: ["packages/ui/src/**", "packages/pages/src/**"],
      jsPlugins: ["./packages/ui/oxlint-panda.mjs"],
      rules: {
        "@pandacss/no-debug": "error",
        "@pandacss/no-deprecated": "error",
        "@pandacss/no-invalid-nesting": "error",
        "@pandacss/no-invalid-token-paths": "error",
        // @pandacss/eslint-plugin 2.0.1 reports every ternary as "conditional" and opacity-modified tokens as raw.
        "@pandacss/prefer-token": [
          "error",
          { categories: ["colors"], allow: ["conditional", "bg/16", "bg/75"] },
        ],
      },
    },
  ],
  options: {
    // `typeAware` is honoured only in the config oxlint loads as its root, which
    // is why the whole repo is linted in one run from here rather than per package.
    typeAware: true,
  },
});
