import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
    panda: "src/panda.ts",
  },
  checks: {
    pluginTimings: false,
  },
  // The node platform bundles deps' CommonJS builds, which drags a node:module import into index.
  platform: "neutral",
  fixedExtension: true,
  inputOptions: { resolve: { mainFields: ["module", "main"] } },
  // styled-system is unpublished, so it must stay bundled.
  neverBundle: ["react", "react-dom", "@construkt-kit/preset", "@pandacss/dev"],
  deps: {
    // Atlaskit ships no exports map, so Node ESM can only load it from our bundle.
    onlyBundle: [
      /^@atlaskit\/pragmatic-drag-and-drop/,
      "@babel/runtime",
      "bind-event-listener",
      "raf-schd",
    ],
  },
});
