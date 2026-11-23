import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";

const hiddenInput = (page: Page) => page.locator("input[type='file']");

const inputFileNames = (page: Page) =>
  hiddenInput(page).evaluate((input: HTMLInputElement) =>
    Array.from(input.files ?? [], (file) => file.name),
  );

const textFile = (name: string) => ({ name, mimeType: "text/plain", buffer: Buffer.from(name) });

storyTest(
  ["components-fileupload--default"],
  "a refused pick and a cancelled one leave the chosen file in the form",
  async ({ gallery, page }) => {
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

storyTest(
  ["components-fileupload--dropzone"],
  "Space on the dropzone opens the picker without scrolling the page",
  async ({ gallery, page }) => {
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
    await gallery.settle();

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  },
  { only: "desktop" },
);
