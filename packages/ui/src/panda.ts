import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { construktKitPreset } from "@construkt-kit/preset";
import { type Config, defineConfig } from "@pandacss/dev";

// Resolve ui's shipped buildinfo from the consumer's cwd (survives hoisting + config bundling; throws if ui is missing).
const CONSTRUKT_BUILDINFO = createRequire(pathToFileURL(`${process.cwd()}/`).href).resolve(
  "@construkt-kit/ui/panda.buildinfo.json",
);

// Pre-wires a consumer panda.config; `presets`/`include` append, other fields override.
export function createConstruktPandaConfig(overrides: Config = {}): Config {
  const { presets = [], include = [], ...rest } = overrides;

  return defineConfig({
    preflight: true,
    jsxFramework: "react",
    importMap: "@construkt-kit/styled-system",
    outdir: "styled-system",
    staticCss: { recipes: "*" },
    ...rest,
    presets: ["@pandacss/preset-base", construktKitPreset, ...presets],
    include: [CONSTRUKT_BUILDINFO, ...include],
  });
}
