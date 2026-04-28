import { createRequire } from "node:module";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const storybookBasePath = normalizeBasePath(process.env.CONSTRUCT_KIT_STORYBOOK_BASE_PATH);

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
    "../../../packages/pages/src/**/*.stories.@(ts|tsx)",
  ],

  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("msw-storybook-addon")],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  refs: {},

  features: {
    sidebarOnboardingChecklist: false,
  },

  viteFinal(configOptions: Parameters<NonNullable<StorybookConfig["viteFinal"]>>[0]) {
    const uiDir = path.resolve(__dirname, "../../../packages/ui");
    const styledSystemDir = path.resolve(__dirname, "../../../packages/styled-system");

    // Force a single React instance by resolving from this package's dependencies
    const reactDir = path.dirname(require.resolve("react/package.json"));
    const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

    // pnpm store instead of frontend-shared's. Tell Vite to resolve it from the correct location.
    const arkUiDir = path.dirname(
      require.resolve("@ark-ui/react/package.json", { paths: [uiDir] }),
    );

    return {
      ...configOptions,
      base: storybookBasePath,
      plugins: [
        ...(configOptions.plugins ?? []),
        {
          name: "resolve-ark-ui",
          enforce: "pre" as const,
          resolveId(source: string) {
            // Redirect @ark-ui/react imports to the correct pnpm store location
            if (source === "@ark-ui/react" || source.startsWith("@ark-ui/react/")) {
              try {
                // require.resolve gives us .cjs paths; swap to .js for ESM
                const resolved = require.resolve(source, {
                  paths: [arkUiDir.replace(/[/\\]@ark-ui[/\\]react$/, "")],
                });
                return resolved.replace(/\.cjs$/, ".js");
              } catch {
                return null;
              }
            }
            return null;
          },
        },
      ],
      resolve: {
        ...configOptions.resolve,
        alias: [
          ...(Array.isArray(configOptions.resolve?.alias) ? configOptions.resolve.alias : []),
          {
            find: /^@construct-kit\/styled-system\/(.*)$/,
            replacement: path.join(styledSystemDir, "dist") + "/$1",
          },
          { find: "react/jsx-runtime", replacement: path.join(reactDir, "jsx-runtime") },
          { find: "react/jsx-dev-runtime", replacement: path.join(reactDir, "jsx-dev-runtime") },
          { find: /^react-dom($|\/)/, replacement: reactDomDir + "/" },
          { find: /^react$/, replacement: path.join(reactDir, "index.js") },
        ],
        dedupe: ["react", "react-dom"],
      },
      optimizeDeps: {
        ...configOptions.optimizeDeps,
        include: [
          ...(configOptions.optimizeDeps?.include ?? []),
          "@tanstack/react-query",
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
        ],
      },
    };
  },
};

export default config;

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
