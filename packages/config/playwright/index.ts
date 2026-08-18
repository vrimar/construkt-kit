import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

export function createPlaywrightConfig(overrides: Partial<PlaywrightTestConfig> = {}) {
  const { use, webServer, ...rest } = overrides;

  return defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    ...rest,
    use: {
      baseURL: baseUrl,
      trace: "on-first-retry",
      ...use,
    },
    webServer: Array.isArray(webServer)
      ? webServer
      : {
          command: "pnpm dev",
          url: baseUrl,
          reuseExistingServer: !process.env.CI,
          ...webServer,
        },
  });
}
