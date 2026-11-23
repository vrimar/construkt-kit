import { BROWSER_TESTS, browserProjects, jsdomSetup } from "@construkt-kit/story-kit/vitest";
import { configDefaults, defineConfig } from "vitest/config";

import { commands } from "./test/commands.ts";

const SSR_TESTS = "src/**/*.ssr.test.tsx";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "core",
          environment: "node",
          include: ["src/core/**/*.test.ts", "src/preset/**/*.test.ts", SSR_TESTS],
        },
      },
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/react/**/*.test.{ts,tsx}"],
          exclude: [...configDefaults.exclude, BROWSER_TESTS, SSR_TESTS],
          setupFiles: [jsdomSetup],
        },
      },
      ...browserProjects({ commands }),
    ],
  },
});
