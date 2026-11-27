import { readFileSync } from "node:fs";

import { createTsdownConfig } from "@construkt-kit/config/tsdown";

const manifest = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const external = [...Object.keys(manifest.peerDependencies), ...Object.keys(manifest.dependencies)];

export default createTsdownConfig({
  entry: {
    index: "src/index.ts",
    config: "src/config.ts",
    mdx: "src/mdx.ts",
    preset: "src/preset/index.ts",
    cli: "src/core/cli.ts",
  },
  platform: "node",
  fixedExtension: true,
  neverBundle: external.map((name) => new RegExp(`^${name}(/|$)`)),
  deps: { onlyImport: external },
});
