import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FileUpload } from "./FileUpload";

describe("FileUpload.Items", () => {
  it("keeps one row per file when two files share a name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FileUpload.Root maxFiles={5}>
        <FileUpload.HiddenInput />
        <FileUpload.ItemGroup>
          <FileUpload.Items clearable />
        </FileUpload.ItemGroup>
      </FileUpload.Root>,
    );
    const input = container.querySelector<HTMLInputElement>("input[type='file']");
    if (!input) throw new Error("No file input");
    const rows = () => container.querySelectorAll('[data-scope="file-upload"][data-part="item"]');

    await user.upload(input, [
      new File(["a"], "report.csv"),
      new File(["notes"], "notes.txt"),
      new File(["bb"], "report.csv"),
    ]);
    expect(rows()).toHaveLength(3);

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(rows()).toHaveLength(2);
  });
});
