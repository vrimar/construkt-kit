import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { STORY_GLOBS, repoRoot, storybookConfigDir } from "@construkt-kit/story-kit/paths";
import type { StorybookConfig } from "@storybook/react-vite";
import { defineMain } from "@storybook/react-vite/node";

import { kitResolution } from "../vite.shared.ts";
import { settleWorkspaceBuilds } from "./settleWorkspaceBuilds.ts";

const storybookBasePath = normalizeBasePath(process.env.CONSTRUKT_KIT_STORYBOOK_BASE_PATH);

export default defineMain({
  stories: STORY_GLOBS.map((glob) => `${relative(storybookConfigDir, repoRoot)}/${glob}`),

  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-mcp"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  refs: {},

  features: {
    sidebarOnboardingChecklist: false,
  },

  viteFinal(configOptions: Parameters<NonNullable<StorybookConfig["viteFinal"]>>[0]) {
    const kit = kitResolution();

    return {
      ...configOptions,
      base: storybookBasePath,
      plugins: [...(configOptions.plugins ?? []), settleWorkspaceBuilds()],
      build: {
        ...configOptions.build,
        rolldownOptions: {
          ...configOptions.build?.rolldownOptions,
          checks: {
            ...configOptions.build?.rolldownOptions?.checks,
            pluginTimings: false,
          },
        },
      },
      resolve: {
        ...configOptions.resolve,
        alias: [
          ...(Array.isArray(configOptions.resolve?.alias) ? configOptions.resolve.alias : []),
          ...kit.alias,
        ],
        dedupe: kit.dedupe,
      },
      optimizeDeps: {
        ...configOptions.optimizeDeps,
        include: [...(configOptions.optimizeDeps?.include ?? []), ...kit.optimizeDepsInclude],
      },
    };
  },
});

function normalizeBasePath(value: string | undefined) {
  if (!value) {
    return "/";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === "/") {
    return "/";
  }

  return `/${trimmedValue.replace(/^\/+|\/+$/g, "")}/`;
}

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
