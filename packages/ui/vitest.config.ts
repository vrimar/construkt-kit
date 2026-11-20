import pandacss from "@pandacss/dev/postcss";
import { type PlaywrightProviderOptions, playwright } from "@vitest/browser-playwright";
import { type TestProjectInlineConfiguration, configDefaults, defineConfig } from "vitest/config";

import { commands } from "./test/commands.ts";

const css = { postcss: { plugins: [pandacss({ configPath: "./panda.config.ts" })] } };

const browserProject = (
  name: "browser" | "touch",
  viewport: { width: number; height: number },
  contextOptions?: PlaywrightProviderOptions["contextOptions"],
): TestProjectInlineConfiguration => ({
  css,
  test: {
    name,
    include: [`src/**/*.${name}.test.{ts,tsx}`],
    setupFiles: ["./test/setup.browser.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions }),
      instances: [{ browser: "chromium" }],
      commands,
      viewport,
    },
  },
});

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}", "codemods/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "src/**/*.{browser,touch}.test.{ts,tsx}"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      browserProject("browser", { width: 1280, height: 800 }),
      browserProject("touch", { width: 390, height: 844 }, { hasTouch: true, isMobile: true }),
    ],
  },
});
