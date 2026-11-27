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
    "No Panda build extracts this package's source, so css(), styled and patterns ship classes with no CSS. Use the package's recipes, inline geometry or CSS variables.",
};

const ARK_IMPORTS = {
  group: ["@ark-ui/*", "@ark-ui/*/**", "@zag-js/*", "@zag-js/*/**"],
  message: "The kit builds on its own primitives in packages/ui/src/primitives; use those.",
};

export default createOxlintConfig({
  ignorePatterns: ["**/dist/**", "**/storybook-static/**", "**/styled-system/**", "**/test/gen/**"],
  jsPlugins: ["./packages/story-kit/oxlint-stories.mjs"],
  settings: { construkt: { styledSystem: "packages/ui/styled-system" } },
  rules: {
    "no-restricted-imports": ["error", { patterns: [ARK_IMPORTS] }],
  },
  overrides: [
    {
      files: ["**/bin/**", "**/scripts/**"],
      rules: { "no-console": "off" },
    },
    {
      files: [
        "packages/ui/src/**",
        "packages/pages/src/**",
        "packages/data-grid/src/**",
        "packages/docs/src/**",
      ],
      jsPlugins: ["./packages/ui/oxlint-panda.mjs"],
      rules: {
        "@pandacss/no-debug": "error",
        "@pandacss/no-deprecated": "error",
        "@pandacss/no-invalid-nesting": "error",
        "@pandacss/no-invalid-token-paths": "error",
        "@pandacss/prefer-token": ["error", { categories: ["colors"] }],
      },
    },
    {
      files: ["packages/data-grid/src/**", "packages/docs/src/**"],
      rules: {
        "construkt/no-literal-style-props": "error",
        "no-restricted-imports": ["error", { patterns: [PANDA_RUNTIME_IMPORTS, ARK_IMPORTS] }],
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
              ARK_IMPORTS,
            ],
          },
        ],
      },
    },
    {
      files: ["packages/docs/src/core/**"],
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
                  "lucide-react",
                  "minisearch",
                  "@construkt-kit/ui",
                  "@construkt-kit/ui/*",
                  "**/styled-system/**",
                ],
                message:
                  "The docs core runs in Node at build time: no React, ui, Panda or browser-side imports.",
              },
              ARK_IMPORTS,
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
        "stories/a11y-opt-out": "error",
        "stories/no-play": "error",
        "stories/viewport-tag": "error",
      },
    },
    {
      files: ["packages/*/src/**/*.spec.ts"],
      rules: {
        "stories/spec-asserts": "error",
        "stories/spec-screenshot-via-gallery": "error",
      },
    },
  ],
  options: {
    // `typeAware` is honoured only in the config oxlint loads as its root, which
    // is why the whole repo is linted in one run from here rather than per package.
    typeAware: true,
  },
});
