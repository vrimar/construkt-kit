import type { Locator } from "@playwright/test";

import { byId } from "./popup";

/**
 * Hovers `trigger` and returns the tooltip it shows, once that tooltip describes it: past its open
 * delay, whatever `openDelay` it has. A trigger whose tooltip opens only while its text is cut off
 * (`showWhenTruncated`) shows none while it fits, and the wait fails.
 */
export async function hoverTooltip(trigger: Locator): Promise<Locator> {
  const page = trigger.page();
  const element = await trigger.elementHandle();
  try {
    await trigger.hover();
    const id = await page.waitForFunction(
      (target) =>
        target
          ?.getAttribute("aria-describedby")
          ?.split(/\s+/)
          .find(
            (ref) => target.ownerDocument.getElementById(ref)?.getAttribute("role") === "tooltip",
          ),
      element,
    );
    return page.locator(byId(String(await id.jsonValue())));
  } finally {
    await element?.dispose();
  }
}
