import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
export const storyKitDir = path.join(repoRoot, "packages/story-kit");
export const storybookDir = path.join(repoRoot, "apps/storybook");
export const storybookConfigDir = path.join(storybookDir, ".storybook");
export const baselineDir = path.join(storybookDir, "__baselines__");
export const reportDir = path.join(storybookDir, ".stories-report");
export const cacheDir = path.join(repoRoot, "node_modules/.cache/story-kit");
export const storyIdsFile = path.join(storyKitDir, "src/story-ids.gen.ts");
export const browserImageFile = path.join(storyKitDir, "browser-image.json");

export const PROJECTS = ["desktop", "phone"] as const;
export const SWEEP_SPEC = "apps/storybook/tests/sweep.spec.ts";
export const BASELINE_DIR_RELATIVE = "apps/storybook/__baselines__";
