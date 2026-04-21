import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

export function createPlaywrightConfig(overrides: Partial<PlaywrightTestConfig> = {}) {
  return defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
      trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
      command: "pnpm dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
    ...overrides,
  });
}
