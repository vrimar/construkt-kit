import type { commands } from "./commands";

type ClientCommands<T> = {
  [K in keyof T]: T[K] extends (context: never, ...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : never;
};

declare module "vitest/browser" {
  interface BrowserCommands extends ClientCommands<typeof commands> {}
}
