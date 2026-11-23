import path from "node:path";

import { repoRoot } from "./repo-root.ts";

export { repoRoot };
export const storyKitDir = path.join(repoRoot, "packages/story-kit");
export const storybookDir = path.join(repoRoot, "apps/storybook");
export const storybookConfigDir = path.join(storybookDir, ".storybook");
export const BASELINE_DIR_RELATIVE = "apps/storybook/__baselines__";
export const baselineDir = path.join(repoRoot, BASELINE_DIR_RELATIVE);
export const reportDir = path.join(storybookDir, ".stories-report");
export const cacheDir = path.join(repoRoot, "node_modules/.cache/story-kit");
export const storyIdsFile = path.join(storyKitDir, "src/story-ids.gen.ts");
export const playwrightConfigFile = path.join(storyKitDir, "playwright.config.ts");

export const SWEEP_SPEC = "apps/storybook/tests/sweep.spec.ts";

/** Every behaviour spec, relative to the repo root. */
export const BEHAVIOUR_SPECS = "packages/*/src/**/*.spec.ts";

/** The packages whose `src` holds stories; the Storybook app's own `stories/` holds the rest. */
export const STORY_PACKAGES = ["ui", "pages", "data-grid"] as const;

/** Every story file, relative to the repo root. */
export const STORY_GLOBS = [
  "apps/storybook/stories/**/*.stories.tsx",
  ...STORY_PACKAGES.map((name) => `packages/${name}/src/**/*.stories.tsx`),
];

/** The committed screenshot of a story on a project. */
export function baselineFile(project: string, storyId: string): string {
  return path.join(baselineDir, project, `${storyId}.png`);
}
