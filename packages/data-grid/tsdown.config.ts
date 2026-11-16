import { createTsdownConfig } from "@construkt-kit/config/tsdown";

const peers = ["react", "react-dom", "@construkt-kit/ui", "@pandacss/dev"];

export default createTsdownConfig({
  entry: { index: "src/index.ts", preset: "src/preset/index.ts" },
  platform: "neutral",
  fixedExtension: true,
  neverBundle: peers.map((name) => new RegExp(`^${name}(/|$)`)),
  deps: { onlyImport: peers },
});
