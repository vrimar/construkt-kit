import { createOxlintConfig } from "@construkt-kit/config/oxlint";

export default createOxlintConfig({
  ignorePatterns: ["**/dist/**", "**/storybook-static/**", "**/styled-system/**"],
  overrides: [
    {
      files: ["**/bin/**", "**/scripts/**"],
      rules: { "no-console": "off" },
    },
  ],
  options: {
    // `typeAware` is honoured only in the config oxlint loads as its root, which
    // is why the whole repo is linted in one run from here rather than per package.
    typeAware: true,
  },
});
