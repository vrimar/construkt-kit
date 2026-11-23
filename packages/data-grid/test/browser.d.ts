import type { ClientCommands } from "@construkt-kit/story-kit/vitest";

import type { commands } from "./commands";

declare module "vitest/browser" {
  interface BrowserCommands extends ClientCommands<typeof commands> {}
}
