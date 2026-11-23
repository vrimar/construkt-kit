import { BROWSER_TESTS, browserProjects, jsdomSetup } from "@construkt-kit/story-kit/vitest";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}", "codemods/**/*.test.ts"],
          exclude: [...configDefaults.exclude, BROWSER_TESTS],
          setupFiles: [jsdomSetup],
        },
      },
      ...browserProjects(),
    ],
  },
});
