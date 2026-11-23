import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { hoverTooltip } from "./tooltip";

storyTest(
  ["components-tooltip--default-open"],
  "hoverTooltip returns the hovered trigger's tooltip, not the one leaving",
  async ({ page }) => {
    const tooltip = await hoverTooltip(page.getByRole("button", { name: "Redo" }));

    await expect(tooltip).toHaveText(/^Redo/);
  },
  { only: "desktop" },
);

storyTest(
  ["components-tooltip--group"],
  "hoverTooltip finds the tooltip a TooltipGroup shares",
  async ({ page }) => {
    const label = "Quarterly revenue by region and product line";

    const tooltip = await hoverTooltip(page.getByText(label));

    await expect(tooltip).toHaveText(label);
  },
  { only: "desktop" },
);
