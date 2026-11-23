import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { dropFiles } from "./fileUpload";

const textFile = (name: string) => ({ name, mimeType: "text/plain", buffer: Buffer.from(name) });

storyTest(
  ["components-fileupload--dropzone"],
  "dropFiles adds the files dropped on the dropzone",
  async ({ page }) => {
    await dropFiles(page.getByText("Drag and drop files here, or click to select"), [
      textFile("notes.txt"),
      textFile("budget.txt"),
    ]);

    await expect(page.getByText("notes.txt")).toBeVisible();
    await expect(page.getByText("budget.txt")).toBeVisible();
  },
);
