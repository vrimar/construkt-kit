import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { FileUpload, type FileUploadRenderState } from "./FileUpload";

const hiddenInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>("input[type='file']");
  if (!input) throw new Error("No file input");
  return input;
};

describe("FileUpload", () => {
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
    const rows = () => container.querySelectorAll("[data-slot=item]");

    await user.upload(hiddenInput(container), [
      new File(["a"], "report.csv"),
      new File(["notes"], "notes.txt"),
      new File(["bb"], "report.csv"),
    ]);
    expect(rows()).toHaveLength(3);

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(rows()).toHaveLength(2);
  });

  it("refuses a file it holds but takes one modified at another time", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onFileReject = vi.fn();
    const { container } = render(
      <FileUpload.Root
        maxFiles={5}
        onValueChange={onValueChange}
        onFileReject={onFileReject}
      >
        <FileUpload.HiddenInput />
      </FileUpload.Root>,
    );

    await user.upload(hiddenInput(container), new File(["a"], "a.txt", { lastModified: 1 }));
    await user.upload(hiddenInput(container), [
      new File(["a"], "a.txt", { lastModified: 1 }),
      new File(["a"], "a.txt", { lastModified: 2 }),
    ]);

    expect(onValueChange.mock.lastCall?.[0]).toHaveLength(2);
    expect(
      onFileReject.mock.lastCall?.[0].map((rejection: { errors: string[] }) => rejection.errors),
    ).toEqual([["FILE_EXISTS"]]);
  });

  it("refuses the whole pick when it would go past maxFiles", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onFileReject = vi.fn();
    const { container } = render(
      <FileUpload.Root
        maxFiles={2}
        onValueChange={onValueChange}
        onFileReject={onFileReject}
      >
        <FileUpload.HiddenInput />
      </FileUpload.Root>,
    );

    await user.upload(hiddenInput(container), [
      new File(["a"], "a.txt"),
      new File(["b"], "b.txt"),
      new File(["c"], "c.txt"),
    ]);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(
      onFileReject.mock.lastCall?.[0].map((rejection: { errors: string[] }) => rejection.errors),
    ).toEqual([["TOO_MANY_FILES"], ["TOO_MANY_FILES"], ["TOO_MANY_FILES"]]);
  });

  it("keeps the file a single-file upload already holds when it is picked again", async () => {
    const user = userEvent.setup();
    const onFileReject = vi.fn();
    const { container } = render(
      <FileUpload.Root onFileReject={onFileReject}>
        <FileUpload.HiddenInput />
      </FileUpload.Root>,
    );
    await user.upload(hiddenInput(container), new File(["data"], "report.csv"));
    await user.upload(hiddenInput(container), new File(["data"], "report.csv"));

    expect(onFileReject).not.toHaveBeenCalled();
  });

  it("validates files added through the render state like picked ones", () => {
    const onValueChange = vi.fn();
    const onFileReject = vi.fn();
    let upload: FileUploadRenderState | undefined;
    render(
      <FileUpload.Root
        maxFiles={3}
        maxFileSize={4}
        onValueChange={onValueChange}
        onFileReject={onFileReject}
        render={(props, state) => {
          upload = state;
          return <section {...props} />;
        }}
      />,
    );

    expect(upload?.addFiles([new File(["too large"], "shot.png")])).toBe(false);
    expect(onFileReject.mock.lastCall?.[0][0].errors).toEqual(["FILE_TOO_LARGE"]);
    expect(onValueChange).not.toHaveBeenCalled();

    const small = new File(["ok"], "small.png");
    expect(upload?.addFiles([small])).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith([small], expect.anything());
  });

  it("adds files on top of an earlier addFiles in the same handler, up to maxFiles", () => {
    let upload: FileUploadRenderState | undefined;
    render(
      <FileUpload.Root
        maxFiles={2}
        render={(props, state) => {
          upload = state;
          return <section {...props} />;
        }}
      />,
    );

    act(() => {
      upload?.addFiles([new File(["a"], "a.txt")]);
      upload?.addFiles([new File(["b"], "b.txt")]);
      upload?.addFiles([new File(["c"], "c.txt")]);
    });

    expect(upload?.value.map((file) => file.name)).toEqual(["a.txt", "b.txt"]);
    expect(upload?.rejectedFiles.map(({ file, errors }) => [file.name, errors])).toEqual([
      ["c.txt", ["TOO_MANY_FILES"]],
    ]);
  });
});
