import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "typescript", "import"],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  rules: {
    "no-unused-vars": [
      "warn",
      {
        fix: {
          imports: "safe-fix",
          variables: "off",
        },
      },
    ],
    "no-console": "warn",
    eqeqeq: ["error", "smart"],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-debugger": "error",
    "no-var": "error",
    "prefer-const": "warn",
    "no-duplicate-case": "error",
    "no-fallthrough": "error",
    "no-self-compare": "error",
    "no-unsafe-optional-chaining": "error",
    "no-loss-of-precision": "error",
    "no-constant-condition": "warn",
    "no-throw-literal": "error",
    "no-shadow": "warn",
    "sort-imports": [
      "warn",
      {
        allowSeparatedGroups: true,
      },
    ],

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
    "typescript/no-non-null-assertion": "warn",
    "typescript/prefer-optional-chain": "warn",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/no-misused-promises": "off",
    "typescript/no-floating-promises": "off",

    "react/jsx-key": "error",
    "react/no-danger": "error",
    "react/jsx-no-target-blank": "error",
    "react/no-children-prop": "error",
    "react/no-array-index-key": "off",
    "react/button-has-type": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-unescaped-entities": "off",

    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    "import/no-duplicates": "error",
    "import/no-cycle": "warn",
    "import/no-self-import": "error",
    "import/no-default-export": "warn",
    "import/first": "error",
  },
});
