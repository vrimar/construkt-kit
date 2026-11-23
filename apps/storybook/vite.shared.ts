import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Alias } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export const repoRoot = path.resolve(here, "../..");

export function kitResolution(): {
  alias: Alias[];
  dedupe: string[];
  optimizeDepsInclude: string[];
} {
  // A second React copy from another package's node_modules breaks hooks.
  const reactDir = path.dirname(require.resolve("react/package.json"));
  const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

  return {
    alias: [
      { find: "react/jsx-runtime", replacement: path.join(reactDir, "jsx-runtime") },
      { find: "react/jsx-dev-runtime", replacement: path.join(reactDir, "jsx-dev-runtime") },
      { find: /^react-dom($|\/)/, replacement: reactDomDir + "/" },
      { find: /^react$/, replacement: path.join(reactDir, "index.js") },
    ],
    dedupe: ["react", "react-dom"],
    optimizeDepsInclude: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  };
}
