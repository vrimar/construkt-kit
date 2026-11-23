import { test as base } from "@playwright/test";

import { type Platform, emulatePlatform } from "./platform";

/** The annotation type that ties a test to a requirement id, for the coverage reporter. */
export const REQUIREMENT = "requirement";

export interface TestingOptions {
  /** Set per project (the preset's `mac` project sets `mac`) to emulate that platform in every page. */
  platform: Platform | undefined;
}

/** Playwright's `test`, emulating each project's `platform` option. Apps extend this one. */
export const test = base.extend<TestingOptions>({
  platform: [undefined, { option: true }],
  context: async ({ context, platform }, provide) => {
    if (platform) await emulatePlatform(context, platform);
    await provide(context);
  },
});

/** The annotation marking a test as the proof of requirement `id`. */
export const requirement = (id: string) => ({ type: REQUIREMENT, description: id });
