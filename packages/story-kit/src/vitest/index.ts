import { fileURLToPath } from "node:url";

// Node loads this file untranspiled and packages type-check it without .ts imports, so no relative import works.
import { touchDrag as dragTouch } from "@construkt-kit/testing";
import pandacss from "@pandacss/dev/postcss";
import { type PlaywrightProviderOptions, playwright } from "@vitest/browser-playwright";
import type { TestProjectInlineConfiguration } from "vitest/config";
import type { BrowserCommand, BrowserConfigOptions } from "vitest/node";

/** Server-side browser commands, typed as test files call them through `commands` from `vitest/browser`. */
export type ClientCommands<T> = {
  [K in keyof T]: T[K] extends (context: never, ...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : never;
};

/**
 * Drags one real touch `dx`, `dy` px from the middle of the element `selector` finds, in ten steps, holds it still for
 * `holdMs` and lifts it.
 */
export const touchDrag: BrowserCommand<
  [selector: string, dx: number, dy: number, holdMs?: number],
  void
> = async (context, selector, dx, dy, holdMs = 0) => {
  await dragTouch(context.page, (await context.frame()).locator(selector), dx, dy, { holdMs });
};

const kitCommands = { touchDrag };

declare module "vitest/browser" {
  interface BrowserCommands extends ClientCommands<typeof kitCommands> {}
}

/** Files a browser project runs, which a `jsdom` project must exclude. */
export const BROWSER_TESTS = "src/**/*.{browser,touch}.test.{ts,tsx}";

/** The setup file of a `jsdom` project: DOM polyfills, a `matchMedia` that matches nothing, Testing Library cleanup. */
export const jsdomSetup = fileURLToPath(new URL("./setup.jsdom.ts", import.meta.url));

const browserSetup = fileURLToPath(new URL("./setup.browser.ts", import.meta.url));

type Commands = NonNullable<BrowserConfigOptions["commands"]>;

type Engine = "chromium" | "firefox" | "webkit";

function browserProject(
  name: "browser" | "touch",
  engines: readonly Engine[],
  viewport: { width: number; height: number },
  commands: Commands,
  contextOptions?: PlaywrightProviderOptions["contextOptions"],
): TestProjectInlineConfiguration {
  return {
    css: { postcss: { plugins: [pandacss({ configPath: "./panda.config.ts" })] } },
    test: {
      name,
      include: [`src/**/*.${name}.test.{ts,tsx}`],
      setupFiles: [browserSetup],
      // WebKit's frames run slowly under CI load, past expect.poll's 1s default; Playwright waits 5s.
      expect: { poll: { timeout: 5_000 } },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({ contextOptions }),
        instances: engines.map((browser) => ({ browser })),
        commands: { ...kitCommands, ...commands },
        viewport,
      },
    },
  };
}

// WebKit's browser tests time out under CI's load; they run locally, and CI's story tests cover WebKit.
const BROWSER_ENGINES: readonly Engine[] = process.env.CI
  ? ["chromium", "firefox"]
  : ["chromium", "firefox", "webkit"];

/**
 * The `browser` (Chromium, Firefox and WebKit, WebKit not in CI, 1280×800) and `touch` (Chromium with touch, 390×844) projects, styled by the package's
 * `panda.config.ts`. Every project gets `touchDrag`; `commands` adds the package's own.
 */
export function browserProjects({
  commands = {},
}: { commands?: Commands } = {}): TestProjectInlineConfiguration[] {
  return [
    browserProject("browser", BROWSER_ENGINES, { width: 1280, height: 800 }, commands),
    browserProject("touch", ["chromium"], { width: 390, height: 844 }, commands, {
      hasTouch: true,
      isMobile: true,
    }),
  ];
}
