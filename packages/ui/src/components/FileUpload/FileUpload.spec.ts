import { type Page, expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const hiddenInput = (page: Page) => page.locator("input[type='file']");

const inputFileNames = (page: Page) =>
  hiddenInput(page).evaluate((input: HTMLInputElement) =>
    Array.from(input.files ?? [], (file) => file.name),
  );

const textFile = (name: string) => ({ name, mimeType: "text/plain", buffer: Buffer.from(name) });

for (const id of selectStories(["components-fileupload--default"])) {
  test(
    `${id} a refused pick and a cancelled one leave the chosen file in the form`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await hiddenInput(page).setInputFiles(textFile("report.txt"));
      await expect(page.getByText("report.txt")).toBeVisible();

      await hiddenInput(page).setInputFiles(
        ["a", "b", "c", "d", "e"].map((name) => textFile(`${name}.txt`)),
      );
      await expect.poll(() => inputFileNames(page)).toEqual(["report.txt"]);

      const chooser = page.waitForEvent("filechooser");
      await gallery.press(page.getByRole("button", { name: "Choose File" }));
      await chooser;
      await hiddenInput(page).dispatchEvent("cancel");

      await expect.poll(() => inputFileNames(page)).toEqual(["report.txt"]);
    },
  );
}

for (const id of selectStories(["components-fileupload--dropzone"])) {
  test(
    `${id} Space on the dropzone opens the picker without scrolling the page`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.evaluate(() => {
        Object.assign(document.body.style, {
          overflow: "visible",
          height: "auto",
          minHeight: "300vh",
        });
      });
      await page.locator("[data-slot=dropzone]").focus();

      const chooser = page.waitForEvent("filechooser");
      await page.keyboard.press("Space");
      await chooser;
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );

      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    },
  );
}
