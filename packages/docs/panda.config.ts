import { defineConfig } from "@pandacss/dev";

import { docsPreset } from "./src/preset";

export default defineConfig({
  designSystem: "@construkt-kit/ui",
  presets: [docsPreset],
  include: [],
  outdir: "styled-system",
});
