import { defineConfig } from "@pandacss/dev";

import { dataGridPreset } from "./src/preset";

export default defineConfig({
  designSystem: "@construkt-kit/ui",
  presets: [dataGridPreset],
  include: [],
  outdir: "styled-system",
});
