import path from "node:path";
import { fileURLToPath } from "node:url";

import { STORY_GLOBS } from "@construkt-kit/story-kit/paths";
import { stories } from "@construkt-kit/story-kit/story-ids";
import react from "@vitejs/plugin-react";
import { type Plugin, defineConfig } from "vite";

import { kitResolution, repoRoot } from "../vite.shared.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const kit = kitResolution();
const STORY_MODULES = "virtual:story-modules";

function storyModuleMap(): Plugin {
  const resolved = `\0${STORY_MODULES}`;
  return {
    name: "construkt-kit:story-modules",
    resolveId: (id) => (id === STORY_MODULES ? resolved : undefined),
    load(id) {
      if (id !== resolved) return;
      const files = [...new Set(Object.values(stories).map((story) => story.file))].sort();
      const loaders = files.map(
        (file) =>
          `  ${JSON.stringify(file)}: () => import(${JSON.stringify(path.join(repoRoot, file))}),`,
      );
      return `export const storyModules = {\n${loaders.join("\n")}\n};\n`;
    },
  };
}

export default defineConfig({
  root: here,
  plugins: [react(), storyModuleMap()],
  resolve: { alias: kit.alias, dedupe: kit.dedupe },
  optimizeDeps: {
    include: kit.optimizeDepsInclude,
    entries: [
      path.join(here, "index.html"),
      ...STORY_GLOBS.map((glob) => path.relative(here, path.join(repoRoot, glob))),
    ],
  },
  build: {
    outDir: path.resolve(here, "../gallery-dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4096,
    rolldownOptions: { checks: { pluginTimings: false } },
  },
  server: { fs: { allow: [repoRoot] } },
});
