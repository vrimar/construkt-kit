import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import checker from "vite-plugin-checker";

const baseConfig = defineConfig({
  plugins: [
    react(),
    checker({
      oxlint: true,
      overlay: false,
    }),
  ],
  build: {
    target: "esnext",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    open: true,
    cors: true,
  },
});

export function createViteConfig(overrides: UserConfig = {}): UserConfig {
  return mergeConfig(baseConfig, overrides);
}

export type { UserConfig as ViteConfig };
