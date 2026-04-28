import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  deps: { neverBundle: ["react", "react-dom", "@construct-kit/preset", "@construct-kit/styled-system"] },
});
