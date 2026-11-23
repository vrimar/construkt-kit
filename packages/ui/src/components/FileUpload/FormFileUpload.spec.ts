import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-fileupload-formfileupload--default"],
  "a click on the icon or the empty end of the field opens the picker",
  async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Select file..." });
    const box = await trigger.boundingBox();
    if (!box) throw new Error("The trigger has no box.");

    for (const x of [12, box.width - 12]) {
      const chooser = page.waitForEvent("filechooser");
      await trigger.click({ position: { x, y: box.height / 2 } });
      expect((await chooser).isMultiple()).toBe(false);
    }
  },
  { only: "desktop" },
);
