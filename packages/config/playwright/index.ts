import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
  type Project,
  type ReporterDescription,
} from "@playwright/test";

/**
 * Every project the preset knows. `mac`, `phone-ios` and `tablet` set the `platform` option that
 * `@construkt-kit/testing`'s `test` emulates, since a device preset leaves `navigator.platform` at the host's.
 */
export const PRESET_PROJECTS = {
  chromium: { use: devices["Desktop Chrome"], grepInvert: /@(mac|phone|tablet)-only\b/ },
  firefox: {
    use: devices["Desktop Firefox"],
    grepInvert: /@(mac|phone|tablet)-only\b|@chromium-only\b/,
  },
  webkit: {
    use: devices["Desktop Safari"],
    grepInvert: /@(mac|phone|tablet)-only\b|@chromium-only\b/,
  },
  mac: { use: { ...devices["Desktop Chrome"], platform: "mac" }, grep: /@mac\b/ },
  "phone-ios": { use: { ...devices["iPhone 15"], platform: "ios" }, grep: /@phone\b/ },
  "phone-android": { use: devices["Pixel 7"], grep: /@phone\b/ },
  tablet: { use: { ...devices["iPad Pro 11"], platform: "ios" }, grep: /@tablet\b/ },
} satisfies Record<string, Omit<Project, "name">>;

export type PresetProject = keyof typeof PRESET_PROJECTS;

export const DESKTOP_ENGINES = [
  "chromium",
  "firefox",
  "webkit",
] as const satisfies readonly PresetProject[];

export interface PlaywrightPresetOptions extends Omit<
  PlaywrightTestConfig,
  "projects" | "reporter"
> {
  /** The preset projects to run; the three desktop engines by default. */
  projects?: readonly PresetProject[];
  /** Reporters run after the console one, such as `@construkt-kit/testing/reporter`. */
  reporters?: ReporterDescription[];
}

/**
 * A Playwright config over the preset's engine and device projects. Tags pick the projects a test
 * runs on: desktop engines run everything not tagged `@mac-only`, `@phone-only` or `@tablet-only`
 * (Firefox and WebKit also skip `@chromium-only`); `mac`, the phones and `tablet` run only tests
 * tagged `@mac`, `@phone` or `@tablet` (a `-only` tag counts).
 */
export function createPlaywrightConfig({
  projects = DESKTOP_ENGINES,
  reporters = [],
  use,
  ...rest
}: PlaywrightPresetOptions = {}) {
  const ci = Boolean(process.env.CI);
  return defineConfig({
    fullyParallel: true,
    forbidOnly: ci,
    retries: ci ? 1 : 0,
    reporter: [[ci ? "github" : "list"], ...reporters],
    ...rest,
    use: {
      trace: ci ? "on-first-retry" : "retain-on-failure",
      screenshot: "only-on-failure",
      ...use,
    },
    projects: projects.map((name) => {
      const { use: deviceUse, ...project } = PRESET_PROJECTS[name];
      return { name, ...project, use: { ...deviceUse } };
    }),
  });
}
