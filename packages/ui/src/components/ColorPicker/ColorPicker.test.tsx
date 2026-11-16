import { render, screen } from "@testing-library/react";
import { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ColorPicker, type UseColorPickerProps, parseColor, useColorPicker } from ".";
import { setupUser, settle, useFakeTime } from "../../_shared/fakeTime";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";

function ProvidedColorPicker(props: UseColorPickerProps) {
  return (
    <ColorPicker.RootProvider value={useColorPicker(props)}>
      <ColorPicker.Content>Body</ColorPicker.Content>
    </ColorPicker.RootProvider>
  );
}

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
    mockMatchMedia(viewportWidth(375));
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

  describe("on phones", () => {
    useFakeTime();

    it("keeps a RootProvider's sheet open on an outside tap its hook prevents", async () => {
      // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
      const user = setupUser({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      mockMatchMedia(viewportWidth(375));
      render(
        <ProvidedColorPicker
          defaultOpen
          onInteractOutside={(event) => event.preventDefault()}
        />,
      );
      await settle();

      await user.click(
        document.querySelector('[data-scope="drawer"][data-part="backdrop"]') as Element,
      );

      await settle();
      expect(screen.queryByText("Body")).not.toBeNull();
    });
  });
});
