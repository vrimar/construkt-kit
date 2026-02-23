import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";
import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import imports from "eslint-plugin-import";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    rules: eslint.configs.recommended.rules,
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist", "node_modules", "styled-system"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2017,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      react: react,
      "react-hooks": reactHooks,
      prettier: prettier,
      "unused-imports": unusedImports,
      import: imports,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...ts.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      "prettier/prettier": "error",
      "no-console": "warn",
      eqeqeq: ["error", "smart"],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": [0, { ignore: ["children"] }],
      "react/function-component-definition": "off",
      "react/no-array-index-key": "off",
      "react/button-has-type": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-vars": "off",
      "react/require-default-props": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "unused-imports/no-unused-imports": "error",
      "import/no-duplicates": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];
