import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StoryTheme } from "@construkt-kit/story-kit/test";
import { defineConfig } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const port = Number(process.env.STORIES_GALLERY_PORT ?? 6107);
const wsEndpoint = process.env.STORIES_BROWSER_WS;
const update = process.env.STORIES_UPDATE;

if (process.argv.some((arg) => /^(-u|--update-snapshots)(=.*)?$/.test(arg))) {
  throw new Error(
    "Snapshot updates are refused. Screenshots: the owner runs `pnpm stories:accept`. Accessibility snapshots: `pnpm stories:aria <story ids>`.",
  );
}
if (process.env.STORIES_PIXELS === "required" && !wsEndpoint) {
  throw new Error(
    "STORIES_PIXELS=required but no pinned browser is connected. Run through `pnpm test:stories`.",
  );
}

const gallery = (command: "dev" | "preview") =>
  `pnpm exec vite ${command === "preview" ? "preview " : ""}--config gallery/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`;

export default defineConfig<{ storyTheme: StoryTheme }>({
  testDir: repoRoot,
  testMatch: ["apps/storybook/tests/**/*.spec.ts", "packages/*/src/**/*.spec.ts"],
  testIgnore: ["**/node_modules/**", "**/dist/**"],
  snapshotPathTemplate: "{testDir}/apps/storybook/__baselines__/{projectName}/{arg}{ext}",
  outputDir: path.join(here, "test-results"),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  updateSnapshots: update === "missing" ? "missing" : update === "aria" ? "changed" : "none",
  reporter: [[process.env.CI ? "github" : "list"], ["@construkt-kit/story-kit/reporter"]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixels: 0, animations: "disabled", caret: "hide", scale: "css" },
  },
  use: {
    browserName: "chromium",
    baseURL: `http://127.0.0.1:${port}`,
    timezoneId: "UTC",
    locale: "en-US",
    colorScheme: "light",
    deviceScaleFactor: 1,
    connectOptions: wsEndpoint ? { wsEndpoint, exposeNetwork: "<loopback>" } : undefined,
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 } },
      grepInvert: /@phone-only/,
    },
    {
      name: "phone",
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      grepInvert: /@desktop-only/,
    },
    {
      name: "desktop-dark",
      use: { viewport: { width: 1280, height: 900 }, colorScheme: "dark", storyTheme: "dark" },
      grepInvert: /@phone-only/,
      testMatch: ["apps/storybook/tests/sweep.spec.ts"],
    },
  ],
  webServer: {
    command: gallery(wsEndpoint ? "preview" : "dev"),
    cwd: here,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
