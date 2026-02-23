// @ts-check

/** @type {import('oxlint').Oxlintrc} */
export default {
  $schema:
    "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  plugins: ["react", "react-hooks", "typescript", "import"],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  rules: {
    // ── ESLint core ────────────────────────────────────────────────
    "no-unused-vars": "warn",
    "no-console": "warn",
    eqeqeq: ["error", "smart"],
    "no-restricted-imports": [
      "error",
      {
        patterns: ["axios", "node-fetch"],
        message: "Use @b3/api instead of direct HTTP libraries",
      },
    ],

    // ── TypeScript ─────────────────────────────────────────────────
    "typescript/no-explicit-any": "off",
    "typescript/no-unused-vars": "warn",
    "typescript/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      },
    ],
    "typescript/no-empty-object-type": "off",

    // ── React ──────────────────────────────────────────────────────
    "react/jsx-key": "error",
    "react/prop-types": "off",
    "react/no-array-index-key": "off",
    "react/button-has-type": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-unescaped-entities": "off",
    "react/require-default-props": "off",

    // ── React Hooks ────────────────────────────────────────────────
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // ── Imports ────────────────────────────────────────────────────
    "import/no-duplicates": "error",
  },
};
