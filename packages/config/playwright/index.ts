import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

export function createPlaywrightConfig(overrides: Partial<PlaywrightTestConfig> = {}) {
  const { use, webServer, ...rest } = overrides;
  const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
  const resolvedUse = {
    baseURL: externalBaseUrl ?? "http://localhost:5173",
    trace: "on-first-retry" as const,
    ...use,
  };

  return defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    ...rest,
    use: resolvedUse,
    webServer:
      Array.isArray(webServer) || externalBaseUrl
        ? webServer
        : {
            command: "pnpm dev",
            url: resolvedUse.baseURL,
            reuseExistingServer: !process.env.CI,
            ...webServer,
          },
  });
}
