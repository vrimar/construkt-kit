import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Alias, Plugin } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export const repoRoot = path.resolve(here, "../..");

export function kitResolution(): {
  plugins: Plugin[];
  alias: Alias[];
  dedupe: string[];
  optimizeDepsInclude: string[];
} {
  const uiDir = path.resolve(repoRoot, "packages/ui");

  // A second React copy from another package's node_modules breaks hooks.
  const reactDir = path.dirname(require.resolve("react/package.json"));
  const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

  const arkUiDir = path.dirname(require.resolve("@ark-ui/react/package.json", { paths: [uiDir] }));

  return {
    plugins: [
      {
        name: "resolve-ark-ui",
        enforce: "pre",
        resolveId(source: string) {
          if (source === "@ark-ui/react" || source.startsWith("@ark-ui/react/")) {
            try {
              // require.resolve returns the CJS build; Vite needs the ESM one.
              const resolved = require.resolve(source, {
                paths: [arkUiDir.replace(/[/\\]@ark-ui[/\\]react$/, "")],
              });
              return resolved.replace(/\.cjs$/, ".js");
            } catch {
              return null;
            }
          }
          return null;
        },
      },
    ],
    alias: [
      { find: "react/jsx-runtime", replacement: path.join(reactDir, "jsx-runtime") },
      { find: "react/jsx-dev-runtime", replacement: path.join(reactDir, "jsx-dev-runtime") },
      { find: /^react-dom($|\/)/, replacement: reactDomDir + "/" },
      { find: /^react$/, replacement: path.join(reactDir, "index.js") },
    ],
    dedupe: ["react", "react-dom"],
    optimizeDepsInclude: [
      "@tanstack/react-query",
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  };
}
