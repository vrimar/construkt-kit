import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { FileUpload } from "./FileUpload";

const cancels = (target: Element, type: "dragover" | "drop", carriesFile: boolean) => {
  const dataTransfer = new DataTransfer();
  if (carriesFile) dataTransfer.items.add(new File(["a"], "a.txt"));
  else dataTransfer.setData("text/plain", "a");
  const event = new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

it("keeps a file dropped beside the dropzone from opening, and leaves other drags alone", () => {
  render(
    <FileUpload.Root>
      <FileUpload.Dropzone>Drop a file</FileUpload.Dropzone>
      <FileUpload.ItemGroup>
        <FileUpload.Items />
      </FileUpload.ItemGroup>
    </FileUpload.Root>,
  );
  const list = screen.getByRole("list");

  expect({
    fileOver: cancels(list, "dragover", true),
    fileDrop: cancels(list, "drop", true),
    textOver: cancels(list, "dragover", false),
    textDrop: cancels(list, "drop", false),
  }).toEqual({ fileOver: true, fileDrop: true, textOver: false, textDrop: false });
});
