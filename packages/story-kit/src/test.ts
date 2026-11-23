import fs from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { touchDrag } from "@construkt-kit/testing";
import {
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
  test as base,
  expect as baseExpect,
} from "@playwright/test";

import { readBrowserImage } from "./browser-image";
import { DEVICE_ONLY, type Device } from "./devices";
import { isPixelRun } from "./env";
import { type StoryTheme, storyUrl } from "./gallery-protocol";
import { type StoryEntry, type StoryId, stories } from "./story-ids.gen";

export { DEVICE_ONLY };
export type { Device, Locator, Page, StoryEntry, StoryId, StoryTheme };

/** The date every story renders on; Calendar "today" and relative dates resolve against it. */
export const FIXED_NOW = new Date("2026-03-11T09:00:00Z");

/** How far a spec waits past a component's timer before asserting whether it fired. */
export const TIMER_SLACK_MS = 500;

const AXE_DISABLED_BY_DEFAULT = ["region"];
const SWIPE_HOLD_MS = 120;

export const expect = baseExpect.extend({
  /** The element is focused and matches `:focus-visible`, so the browser draws its focus ring. */
  async toBeFocusVisible(locator: Locator, options?: { timeout?: number }) {
    const focusVisible = locator.and(locator.page().locator(":focus-visible"));
    let pass: boolean;
    try {
      await (this.isNot ? baseExpect(focusVisible).not : baseExpect(focusVisible)).toBeAttached(
        options,
      );
      pass = !this.isNot;
    } catch {
      pass = this.isNot;
    }
    return {
      pass,
      name: "toBeFocusVisible",
      expected: !this.isNot,
      message: () =>
        `${this.utils.matcherHint("toBeFocusVisible", "locator", "", { isNot: this.isNot })}\n\n` +
        `Locator: ${locator.toString()}\n` +
        `Expected: ${this.isNot ? "not focused, or focused without" : "focused, with"} :focus-visible`,
    };
  },
});

export interface SelectedStory extends StoryEntry {
  id: StoryId;
}

function onlyIds(): Set<string> | null {
  const file = process.env.STORIES_ONLY;
  if (!file) return null;
  return new Set(JSON.parse(fs.readFileSync(file, "utf8")) as string[]);
}

/** Every story in the index, narrowed to `STORIES_ONLY` when a run is limited to affected stories. */
export function selectedStories(): SelectedStory[] {
  const only = onlyIds();
  return (Object.entries(stories) as [StoryId, StoryEntry][])
    .filter(([id]) => only == null || only.has(id))
    .map(([id, entry]) => ({ id, ...entry }));
}

/** The given stories that the current run selects. */
export function selectStories<T extends StoryId>(ids: readonly T[]): T[] {
  const only = onlyIds();
  return ids.filter((id) => only == null || only.has(id));
}

/**
 * Playwright test tags for a story, so projects skip `phone-only` and `desktop-only` stories. `only` keeps a test to
 * one device on a story that renders on both.
 */
export function storyTags(id: StoryId, only?: Device): string[] {
  const tags = new Set<string>(stories[id].tags);
  if (only) tags.add(DEVICE_ONLY[only]);
  return [...tags].map((tag) => `@${tag}`);
}

export interface Gallery {
  /** `phone` on touch projects, `desktop` otherwise. */
  readonly device: Device;
  /** Renders the story alone on the page and waits until it is ready. */
  open(id: StoryId): Promise<void>;
  /** Taps on touch projects and clicks elsewhere. */
  press(target: Locator): Promise<void>;
  /**
   * Drags a real touch `dx`, `dy` px from the middle of `target` and holds it still before lifting,
   * so a swipe ends where it let go rather than by its speed. `whileHeld` runs before the finger
   * lifts. Touch projects only.
   */
  swipe(
    target: Locator,
    dx: number,
    dy: number,
    options?: { whileHeld?: () => Promise<void> },
  ): Promise<void>;
  /** Calls recorded on a story arg created with `fn()`, with arguments serialised to JSON. */
  calls(arg: string): Promise<unknown[][]>;
  /** Resizes an element by setting its inline width, for stories that size themselves with CSS `resize`. */
  resizeTo(target: Locator, width: number): Promise<void>;
  /** Waits two animation frames, for work the page schedules on the next frame to land. */
  settle(): Promise<void>;
  /** Compares the accessibility tree of the page, or of its topmost open modal, with its committed snapshot. */
  expectAriaTree(name: string): Promise<void>;
  /** Fails the test with every axe violation on the page. */
  expectAccessible(): Promise<void>;
  /** Compares the whole page with the committed baseline; skipped when the run has no pinned browser. */
  expectScreenshot(name: string): Promise<void>;
}

interface Fixtures {
  gallery: Gallery;
  storyTheme: StoryTheme;
}

interface WorkerFixtures {
  pixels: boolean;
  workerContext: BrowserContext;
}

async function readGalleryState(page: Page) {
  return page.evaluate(() => ({
    error: window.__gallery?.error,
    a11yRules: window.__gallery?.a11yRules,
  }));
}

function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 5)
        .map((node) => `      ${node.target.join(" ")}`)
        .join("\n");
      const more = violation.nodes.length > 5 ? `\n      … ${violation.nodes.length - 5} more` : "";
      return `  ${violation.id} (${violation.impact ?? "n/a"}): ${violation.help}\n${targets}${more}`;
    })
    .join("\n");
}

async function expectEnvironment(page: Page, testInfo: TestInfo) {
  const { viewport, hasTouch } = testInfo.project.use;
  const actual = await page.evaluate(() => ({
    width: window.screen.width,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    pixelRatio: window.devicePixelRatio,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    interLoaded: document.fonts.check('16px "Inter Variable"'),
  }));
  expect(
    actual,
    "Environment fingerprint mismatch: the page is not rendering in the configured device",
  ).toEqual({
    width: viewport?.width,
    coarsePointer: Boolean(hasTouch),
    pixelRatio: 1,
    timeZone: "UTC",
    locale: "en-US",
    interLoaded: true,
  });
}

async function expectPinnedBrowser(browser: Browser) {
  const image = readBrowserImage();
  const page = await browser.newPage();
  try {
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(
      { chromium: browser.version(), platform: userAgent.includes(image.userAgentPlatform) },
      "The connected browser is not the pinned one in packages/story-kit/browser-image.json",
    ).toEqual({ chromium: image.chromium, platform: true });
  } finally {
    await page.close();
  }
}

function createGallery(
  page: Page,
  testInfo: TestInfo,
  theme: StoryTheme,
  pixels: boolean,
): Gallery {
  let a11yRules: string[] = [];
  const isTouch = Boolean(testInfo.project.use.hasTouch);
  const settle = () =>
    page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );

  return {
    device: isTouch ? "phone" : "desktop",
    async open(id) {
      testInfo.annotations.push({ type: "story", description: id });
      await page.clock.setSystemTime(FIXED_NOW);
      await page.goto(storyUrl(id, theme));
      await page.waitForSelector("html[data-gallery]", { state: "attached" });
      const state = await readGalleryState(page);
      if (state.error) throw new Error(`Story ${id} failed to render:\n${state.error}`);
      a11yRules = state.a11yRules ?? [];
      await expectEnvironment(page, testInfo);
    },
    async press(target) {
      if (isTouch) await target.tap();
      else await target.click();
    },
    async swipe(target, dx, dy, { whileHeld } = {}) {
      if (!isTouch)
        throw new Error("gallery.swipe needs a touch project; keep the test to the phone.");
      await touchDrag(page, target, dx, dy, { holdMs: SWIPE_HOLD_MS, whileHeld });
    },
    async calls(arg) {
      return page.evaluate((name) => {
        if (!window.__gallery) throw new Error("The gallery has not rendered a story.");
        return window.__gallery.calls(name);
      }, arg);
    },
    async resizeTo(target, width) {
      await target.evaluate((element, next) => {
        (element as HTMLElement).style.width = `${next}px`;
      }, width);
      await settle();
    },
    settle,
    async expectAriaTree(name) {
      // showModal() leaves everything outside the dialog inert, which Playwright's snapshot ignores.
      const modal = page.locator("dialog:modal").last();
      const root = (await modal.count()) > 0 ? modal : page.locator("body");
      const file = `${name}.aria.yml`;
      if ((await root.ariaSnapshot()).trim() !== "") {
        await expect.soft(root).toMatchAriaSnapshot({ name: file });
        return;
      }
      const stored = testInfo.snapshotPath(file, { kind: "aria" });
      if (testInfo.config.updateSnapshots !== "none" && !fs.existsSync(stored)) {
        fs.mkdirSync(path.dirname(stored), { recursive: true });
        fs.writeFileSync(stored, "");
      }
      const recorded = fs.existsSync(stored) ? fs.readFileSync(stored, "utf8").trim() : null;
      expect
        .soft(recorded, `The accessibility tree is empty; ${file} must exist and be empty`)
        .toBe("");
    },
    async expectAccessible() {
      const results = await new AxeBuilder({ page })
        // The default mode injects axe twice per run, the second time into a new blank page.
        .setLegacyMode(true)
        .include("body")
        .disableRules([...AXE_DISABLED_BY_DEFAULT, ...a11yRules])
        .analyze();
      expect
        .soft(
          results.violations.map((violation) => violation.id),
          `Accessibility violations:\n${formatViolations(results.violations)}`,
        )
        .toEqual([]);
    },
    async expectScreenshot(name) {
      if (!pixels) return;
      const file = `${name}.png`;
      const baseline = testInfo.snapshotPath(file, { kind: "screenshot" });
      if (!fs.existsSync(baseline) && testInfo.config.updateSnapshots === "none") {
        const actual = testInfo.outputPath(`${name}-actual.png`);
        await page.screenshot({
          path: actual,
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          scale: "css",
        });
        await testInfo.attach(`${name}-actual.png`, { path: actual, contentType: "image/png" });
      }
      await expect.soft(page).toHaveScreenshot(file, { fullPage: true });
    },
  };
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  pixels: [
    async ({ browser, browserName }, provide) => {
      const pixels = isPixelRun() && browserName === "chromium";
      if (pixels) await expectPinnedBrowser(browser);
      await provide(pixels);
    },
    { scope: "worker" },
  ],
  workerContext: [
    async ({ browser }, provide, workerInfo) => {
      const use = workerInfo.project.use;
      const context = await browser.newContext({
        baseURL: use.baseURL,
        viewport: use.viewport,
        // Firefox doesn't derive window.screen from the viewport.
        screen: use.viewport ?? undefined,
        hasTouch: use.hasTouch,
        isMobile: use.isMobile,
        colorScheme: use.colorScheme,
        locale: use.locale,
        timezoneId: use.timezoneId,
        deviceScaleFactor: use.deviceScaleFactor,
      });
      await provide(context);
      await context.close();
    },
    { scope: "worker" },
  ],
  page: async ({ workerContext }, provide) => {
    const page = await workerContext.newPage();
    await provide(page);
    if (page.url() !== "about:blank") {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    await page.close();
    await workerContext.clearCookies();
  },
  storyTheme: ["light", { option: true }],
  gallery: async ({ page, storyTheme, pixels }, provide, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.stack ?? error.message));
    await provide(createGallery(page, testInfo, storyTheme, pixels));
    expect(pageErrors, `Uncaught errors on the page:\n${pageErrors.join("\n\n")}`).toEqual([]);
  },
});

/**
 * One test per selected story among `ids`, titled `<id> <title>` and tagged with the story's tags: it opens the story,
 * then runs `body`. `only` keeps it to one device.
 */
export function storyTest<const Id extends StoryId>(
  ids: readonly Id[],
  title: string,
  body: (args: { gallery: Gallery; page: Page; id: Id }) => Promise<void>,
  { only }: { only?: Device } = {},
): void {
  for (const id of selectStories(ids)) {
    test(`${id} ${title}`, { tag: storyTags(id, only) }, async ({ gallery, page }) => {
      await gallery.open(id);
      await body({ gallery, page, id });
    });
  }
}
