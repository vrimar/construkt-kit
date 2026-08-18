import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { construktKitPreset } from "@construkt-kit/preset";
import { type Config, defineConfig } from "@pandacss/dev";

// Resolve a shipped buildinfo without depending on the caller's cwd. When Panda bundles a
// consumer's config, esbuild shims `__dirname` to the config file's directory — which can always
// resolve @construkt-kit/ui — so lint/codegen work from any cwd (e.g. a monorepo root). `process.cwd()`
// is the fallback for unbundled/direct use.
const resolveBuildInfo = (specifier: string) => {
  const bases = [typeof __dirname === "string" ? __dirname : undefined, process.cwd()];
  for (const base of bases) {
    if (!base) continue;
    try {
      // Anchor `createRequire` at a file inside `base` (the file need not exist); a trailing-slash
      // directory URL resolves node_modules from the parent instead.
      return createRequire(pathToFileURL(`${base}/noop.js`).href).resolve(specifier);
    } catch {
      // try the next base
    }
  }
  return undefined;
};

const CONSTRUKT_BUILDINFO = (() => {
  const resolved = resolveBuildInfo("@construkt-kit/ui/panda.buildinfo.json");
  if (!resolved) {
    throw new Error(
      "@construkt-kit/ui/panda.buildinfo.json could not be resolved — is @construkt-kit/ui installed?",
    );
  }
  return resolved;
})();

// Optional on purpose: apps that don't install pages must still load this config.
const PAGES_BUILDINFO = resolveBuildInfo("@construkt-kit/pages/panda.buildinfo.json");

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
    include: [CONSTRUKT_BUILDINFO, ...(PAGES_BUILDINFO ? [PAGES_BUILDINFO] : []), ...include],
  });
}
