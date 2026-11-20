import { existsSync } from "node:fs";

import type { DevEnvironment, EnvironmentModuleNode, Plugin } from "vite";

const BUILD_OUTPUT = /[\\/](?:packages|apps)[\\/][^\\/]+[\\/](?:dist|panda|styled-system)[\\/]/;
const MAX_HOLD_MS = 60_000;

// Builds and codegen delete their output before rewriting it; updating in between imports gaps.
export function settleWorkspaceBuilds(quietMs = 300): Plugin {
  const pending = new Map<DevEnvironment, Set<EnvironmentModuleNode>>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let heldSince = 0;

  const rebuilt = () =>
    [...pending.values()].every((modules) =>
      [...modules].every((module) => module.file === null || existsSync(module.file)),
    );

  const flush = () => {
    if (!rebuilt() && Date.now() - heldSince < MAX_HOLD_MS) {
      timer = setTimeout(flush, quietMs);
      return;
    }
    for (const [environment, modules] of pending) {
      for (const module of modules) void environment.reloadModule(module);
    }
    pending.clear();
    heldSince = 0;
  };

  return {
    name: "construkt-kit:settle-workspace-builds",
    apply: "serve",
    hotUpdate({ file, modules }) {
      if (!BUILD_OUTPUT.test(file)) return;
      heldSince ||= Date.now();
      const held = pending.get(this.environment) ?? new Set();
      for (const module of modules) held.add(module);
      pending.set(this.environment, held);
      clearTimeout(timer);
      timer = setTimeout(flush, quietMs);
      return [];
    },
  };
}
