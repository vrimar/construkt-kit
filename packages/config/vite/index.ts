import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

const baseConfig = defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      typescript: true,
      overlay: false,
    }),
  ],
  build: {
    target: "esnext",
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
