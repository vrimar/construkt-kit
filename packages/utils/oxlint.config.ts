import baseConfig from "@b3/config/oxlint";

export default {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "no-restricted-imports": [
      "error",
      {
        patterns: ["node-fetch"],
        message: "Use @b3/api instead of direct HTTP libraries",
      },
    ],
  },
};