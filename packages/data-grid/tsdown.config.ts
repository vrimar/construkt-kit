import { createTsdownConfig } from "@construkt-kit/config/tsdown";

const external = [
  "react",
  "react-dom",
  "@construkt-kit/ui",
  "@construkt-kit/utils",
  "@pandacss/dev",
];

export default createTsdownConfig({
  entry: { index: "src/index.ts", preset: "src/preset/index.ts" },
  platform: "neutral",
  fixedExtension: true,
  neverBundle: external.map((name) => new RegExp(`^${name}(/|$)`)),
  deps: { onlyImport: external },
});
