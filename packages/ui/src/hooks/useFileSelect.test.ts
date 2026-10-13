import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ParsedFile, useFileSelect } from "./useFileSelect";

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
const revokeObjectURL = vi.fn();

let inputs: HTMLInputElement[];
let connectedOnClick: boolean[];

beforeEach(() => {
  inputs = [];
  connectedOnClick = [];
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  Object.assign(URL, { createObjectURL, revokeObjectURL });
  vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function (
    this: HTMLInputElement,
  ) {
    inputs.push(this);
    connectedOnClick.push(this.isConnected);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function pick(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", { value: files });
  input.dispatchEvent(new Event("change"));
}

describe("useFileSelect", () => {
  it("attaches a hidden input while picking and removes it after change", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useFileSelect({ onSelect }));

    result.current();
    expect(connectedOnClick).toEqual([true]);
    expect(inputs[0].hidden).toBe(true);

    const file = new File(["a"], "a.png");
    pick(inputs[0], [file]);

    expect(inputs[0].isConnected).toBe(false);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith({
      source: "blob:a.png",
      name: "a.png",
      size: 1,
      file,
    });
  });

  it("removes the input on cancel without selecting", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useFileSelect({ onSelect }));

    result.current();
    expect(inputs[0].isConnected).toBe(true);
    inputs[0].dispatchEvent(new Event("cancel"));

    expect(inputs[0].isConnected).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects null when a single pick has no files", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useFileSelect({ onSelect }));

    result.current();
    pick(inputs[0], []);

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(null);
  });

  it("leaves every object URL for the consumer to revoke", () => {
    const onSelect = vi.fn<(files: ParsedFile[]) => void>();
    const { result, unmount } = renderHook(() => useFileSelect({ multiple: true, onSelect }));

    result.current();
    pick(inputs[0], [new File(["a"], "a.png")]);
    result.current();
    pick(inputs[1], [new File(["b"], "b.png"), new File(["c"], "c.png")]);
    unmount();

    expect(onSelect.mock.calls.map(([files]) => files.map((file) => file.source))).toEqual([
      ["blob:a.png"],
      ["blob:b.png", "blob:c.png"],
    ]);
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });
});
