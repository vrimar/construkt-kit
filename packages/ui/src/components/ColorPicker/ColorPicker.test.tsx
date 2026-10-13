import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ColorPicker, parseColor } from ".";

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
});
