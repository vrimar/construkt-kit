import { render } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { ColorPicker, parseColor } from ".";
import { createMatchMediaController, isBelowBreakpointQuery } from "../../_shared/matchMedia";

describe("ColorPicker", () => {
  it("applies the root slot styles", () => {
    const { container } = render(
      <ColorPicker.Root defaultValue={parseColor("#ffffff")}>
        <ColorPicker.Label>Color</ColorPicker.Label>
      </ColorPicker.Root>,
    );

    const root = container.querySelector('[data-scope="color-picker"][data-part="root"]');
    expect(root?.className).toMatch(/\bcolor-picker__root\b/);
  });

  it("keeps an inline picker on the page on a phone", () => {
    const media = createMatchMediaController(isBelowBreakpointQuery);
    vi.spyOn(window, "matchMedia").mockImplementation(media.matchMedia);
    onTestFinished(() => {
      vi.restoreAllMocks();
    });
    render(
      <ColorPicker.Root inline>
        <ColorPicker.Content>
          <ColorPicker.Area>
            <ColorPicker.AreaBackground />
            <ColorPicker.AreaThumb />
          </ColorPicker.Area>
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );

    const area = document.querySelector('[data-scope="color-picker"][data-part="area"]');
    expect(area).not.toBeNull();
    expect(area?.closest("[data-overlay-sheet]")).toBeNull();
  });
});
