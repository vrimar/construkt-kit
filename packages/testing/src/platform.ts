import type { BrowserContext } from "@playwright/test";

/**
 * The operating system the page believes it runs on. Playwright leaves `navigator.platform` at the
 * host's, so a device preset alone doesn't make `isMacPlatform` or `isIOS` true.
 */
export type Platform = "mac" | "ios" | "windows";

const PLATFORMS = {
  mac: { platform: "MacIntel", uaPlatform: "macOS", touchPoints: 0 },
  ios: { platform: "iPhone", uaPlatform: "iOS", touchPoints: 5 },
  windows: { platform: "Win32", uaPlatform: "Windows", touchPoints: 0 },
} as const;

/** Makes every page in `context` report `platform`, through `navigator` and `userAgentData`. */
export async function emulatePlatform(context: BrowserContext, platform: Platform): Promise<void> {
  await context.addInitScript((values) => {
    const define = (name: string, value: unknown) =>
      Object.defineProperty(Navigator.prototype, name, { configurable: true, get: () => value });
    const original = (navigator as Navigator & { userAgentData?: Record<string, unknown> })
      .userAgentData;
    define("platform", values.platform);
    define("maxTouchPoints", values.touchPoints);
    if (original)
      define("userAgentData", {
        brands: original.brands,
        mobile: values.touchPoints > 0,
        platform: values.uaPlatform,
        getHighEntropyValues: async (hints: string[]) => ({
          ...(await (original.getHighEntropyValues as (h: string[]) => Promise<object>).call(
            original,
            hints,
          )),
          platform: values.uaPlatform,
        }),
        toJSON: () => ({
          brands: original.brands,
          mobile: values.touchPoints > 0,
          platform: values.uaPlatform,
        }),
      });
  }, PLATFORMS[platform]);
}

/** The key that plays Ctrl's part on `platform`, for `page.keyboard.press(`${primaryModifier(p)}+K`)`. */
export const primaryModifier = (platform: Platform | undefined): "Meta" | "Control" =>
  platform === "mac" || platform === "ios" ? "Meta" : "Control";
