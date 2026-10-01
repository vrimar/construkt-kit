import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  checks: {
    pluginTimings: false,
  },
  // The node platform bundles deps' CommonJS builds, which drags a node:module import into index.
  platform: "neutral",
  fixedExtension: true,
  inputOptions: { resolve: { mainFields: ["module", "main"] } },
  // styled-system ships as files; bundling it would duplicate the runtime its `panda lib` exports serve.
  neverBundle: ["react", "react-dom", /^#styled-system\//],
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
