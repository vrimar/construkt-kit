import { createOxlintConfig } from "@construkt-kit/config/oxlint";

const PANDA_RUNTIME_IMPORTS = {
  group: [
    "**/styled-system/css",
    "**/styled-system/css/*",
    "**/styled-system/jsx",
    "**/styled-system/jsx/*",
    "**/styled-system/patterns",
    "**/styled-system/patterns/*",
    "@construkt-kit/ui/css",
    "@construkt-kit/ui/css/*",
    "@construkt-kit/ui/jsx",
    "@construkt-kit/ui/jsx/*",
    "@construkt-kit/ui/patterns",
    "@construkt-kit/ui/patterns/*",
  ],
  message:
    "No Panda build extracts data-grid's source, so css(), styled and patterns ship classes with no CSS. Use the dataGrid recipe, inline geometry or CSS variables.",
};

export default createOxlintConfig({
  ignorePatterns: ["**/dist/**", "**/storybook-static/**", "**/styled-system/**", "**/test/gen/**"],
  overrides: [
    {
      files: ["**/bin/**", "**/scripts/**"],
      rules: { "no-console": "off" },
    },
    {
      files: ["packages/ui/src/**", "packages/pages/src/**", "packages/data-grid/src/**"],
      jsPlugins: ["./packages/ui/oxlint-panda.mjs", "./packages/ui/oxlint-construkt.mjs"],
      rules: {
        "construkt/no-style-prop-name": "error",
        "@pandacss/no-debug": "error",
        "@pandacss/no-deprecated": "error",
        "@pandacss/no-invalid-nesting": "error",
        "@pandacss/no-invalid-token-paths": "error",
        "@pandacss/prefer-token": ["error", { categories: ["colors"] }],
      },
    },
    {
      files: ["packages/data-grid/src/**"],
      rules: {
        "construkt/no-literal-style-props": "error",
        "no-restricted-imports": ["error", { patterns: [PANDA_RUNTIME_IMPORTS] }],
      },
    },
    {
      files: ["packages/data-grid/src/core/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "react",
                  "react/*",
                  "react-dom",
                  "react-dom/*",
                  "@construkt-kit/ui",
                  "@construkt-kit/ui/*",
                  "**/styled-system/**",
                ],
                message: "The grid core is framework-free: no React, ui or Panda imports.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["**/*.stories.tsx"],
      rules: {
        "construkt/no-style-prop-name": "off",
        "construkt/no-literal-style-props": "off",
        "construkt/story-a11y-opt-out": "error",
        "construkt/story-no-play": "error",
        "construkt/story-viewport-tag": "error",
      },
    },
    {
      files: ["packages/*/src/**/*.spec.ts"],
      rules: {
        "construkt/spec-asserts": "error",
        "construkt/spec-screenshot-via-gallery": "error",
      },
    },
  ],
  options: {
    // `typeAware` is honoured only in the config oxlint loads as its root, which
    // is why the whole repo is linted in one run from here rather than per package.
    typeAware: true,
  },
});
