import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

import { DEVICE_ONLY, DEVICES, type Device, PROJECTS } from "./src/devices.ts";
import { UPDATE_FLAGS, UPDATE_REFUSED, browserEndpoint, isPixelRun } from "./src/env.ts";
import type { StoryTheme } from "./src/gallery-protocol.ts";
import {
  BASELINE_DIR_RELATIVE,
  BEHAVIOUR_SPECS,
  SWEEP_SPEC,
  repoRoot,
  storybookDir,
} from "./src/paths.ts";

const port = Number(process.env.STORIES_GALLERY_PORT ?? 6107);
const wsEndpoint = browserEndpoint();
const update = process.env.STORIES_UPDATE;

if (process.argv.some((arg) => UPDATE_FLAGS.test(arg))) throw new Error(UPDATE_REFUSED);
if (process.env.STORIES_PIXELS === "required" && !isPixelRun()) {
  throw new Error(
    "STORIES_PIXELS=required but no pinned browser is connected. Run through `pnpm test:stories`.",
  );
}

const keptToOtherDevices = (device: Device) =>
  new RegExp(
    PROJECTS.filter((other) => other !== device)
      .map((other) => `@${DEVICE_ONLY[other]}`)
      .join("|"),
  );

const gallery = (command: "dev" | "preview") =>
  `pnpm exec vite ${command === "preview" ? "preview " : ""}--config gallery/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`;

export default defineConfig<{ storyTheme: StoryTheme }>({
  testDir: repoRoot,
  testMatch: ["apps/storybook/tests/**/*.spec.ts", BEHAVIOUR_SPECS],
  testIgnore: ["**/node_modules/**", "**/dist/**"],
  snapshotPathTemplate: `{testDir}/${BASELINE_DIR_RELATIVE}/{projectName}/{arg}{ext}`,
  outputDir: path.join(storybookDir, "test-results"),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  updateSnapshots: update === "missing" ? "missing" : update === "aria" ? "changed" : "none",
  reporter: [
    [process.env.CI ? "github" : "list"],
    [fileURLToPath(new URL("./src/reporter.ts", import.meta.url))],
  ],
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
    ...PROJECTS.map((device) => ({
      name: device,
      use: DEVICES[device],
      grepInvert: keptToOtherDevices(device),
    })),
    {
      name: "desktop-dark",
      use: { ...DEVICES.desktop, colorScheme: "dark", storyTheme: "dark" },
      grepInvert: keptToOtherDevices("desktop"),
      testMatch: [SWEEP_SPEC],
    },
    ...(isPixelRun() ? (["webkit", "firefox"] as const) : []).map((browserName) => ({
      name: browserName,
      use: { ...DEVICES.desktop, browserName },
      grepInvert: keptToOtherDevices("desktop"),
      testMatch: [BEHAVIOUR_SPECS],
    })),
  ],
  webServer: {
    command: gallery(isPixelRun() ? "preview" : "dev"),
    cwd: storybookDir,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
