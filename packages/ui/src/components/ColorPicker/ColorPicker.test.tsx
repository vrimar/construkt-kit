import { type Color, formatColor, parseColor } from "@construkt-kit/utils";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ColorPicker } from ".";
import { setupUser, settle, useFakeTime } from "../../_shared/fakeTime";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { sheetOf } from "../../_shared/sheet";

describe("ColorPicker", () => {
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

    const area = document.querySelector('[data-slot="area"]');
    expect(area).not.toBeNull();
    expect(sheetOf(area)).toBeNull();
  });

  it("takes hex typed without a #, and puts back the value's hex for text it can't read", async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultOpen />);
    const input = await screen.findByRole("textbox", { name: "hex" });

    await user.clear(input);
    await user.type(input, "ff0000{Enter}");
    expect(
      screen.getByRole("button", { name: /current color is rgba\(255, 0, 0, 1\)/ }),
    ).toBeTruthy();

    await user.clear(input);
    await user.type(input, "nope{Enter}");
    expect((input as HTMLInputElement).value).toBe("#FF0000");
  });

  it("takes the alpha typed into the css input", async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker.Root
        inline
        defaultValue={parseColor("#336699")}
      >
        <ColorPicker.Content>
          <ColorPicker.ChannelInput channel="css" />
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );
    const css = screen.getByRole<HTMLInputElement>("textbox", { name: "css" });

    await user.clear(css);
    await user.type(css, "rgba(255, 0, 0, 0.5){Enter}");

    expect(css.value).toBe("rgba(255, 0, 0, 0.5)");
  });

  it("takes the alpha of hex typed with one, and keeps its own for hex typed without", async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker.Root
        inline
        defaultValue={parseColor("rgba(51, 102, 153, 0.5)")}
      >
        <ColorPicker.Content>
          <ColorPicker.ChannelInput channel="hex" />
          <ColorPicker.ChannelInput channel="css" />
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );
    const hex = screen.getByRole<HTMLInputElement>("textbox", { name: "hex" });
    const css = screen.getByRole<HTMLInputElement>("textbox", { name: "css" });

    await user.clear(hex);
    await user.type(hex, "ff0000{Enter}");
    expect(css.value).toBe("rgba(255, 0, 0, 0.5)");

    await user.clear(hex);
    await user.type(hex, "ff000000{Enter}");
    expect(css.value).toBe("rgba(255, 0, 0, 0)");
  });

  it("hands focus that lands on its hidden input to its trigger", () => {
    render(<ColorPicker name="color" />);
    const hidden = document.querySelector<HTMLInputElement>('input[name="color"]');

    act(() => hidden?.focus());

    expect(document.activeElement).toBe(screen.getByRole("button", { name: /current color is/ }));
  });

  it("goes back to its first color when the form its hidden input names resets", async () => {
    const user = userEvent.setup();
    render(
      <>
        <form id="paint">
          <button type="reset">Reset</button>
        </form>
        <ColorPicker.Root
          inline
          defaultValue={parseColor("#336699")}
        >
          <ColorPicker.Content>
            <ColorPicker.ChannelInput channel="hex" />
          </ColorPicker.Content>
          <ColorPicker.HiddenInput form="paint" />
        </ColorPicker.Root>
      </>,
    );
    const hex = screen.getByRole<HTMLInputElement>("textbox", { name: "hex" });

    await user.clear(hex);
    await user.type(hex, "ff0000{Enter}");
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(hex.value).toBe("#336699");
  });

  it("keeps a controlled grey's hue as its hue slider moves", () => {
    function Controlled() {
      const [color, setColor] = useState<Color>(parseColor("#808080"));
      return (
        <ColorPicker.Root
          inline
          value={color}
          onValueChange={setColor}
        >
          <ColorPicker.Content>
            <ColorPicker.ChannelSlider channel="hue">
              <ColorPicker.ChannelSliderTrack />
              <ColorPicker.ChannelSliderThumb />
            </ColorPicker.ChannelSlider>
          </ColorPicker.Content>
        </ColorPicker.Root>
      );
    }
    render(<Controlled />);
    const thumb = screen.getByRole("slider", { name: "hue" });

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });

    expect(thumb.getAttribute("aria-valuenow")).toBe("2");
  });

  it("reads a channel slider in a space that has its channel, whatever the view's format", () => {
    const onValueChange = vi.fn();
    render(
      <ColorPicker.Root
        inline
        defaultValue={parseColor("#ff0000")}
        onValueChange={onValueChange}
      >
        <ColorPicker.Content>
          <ColorPicker.ChannelSlider channel="red">
            <ColorPicker.ChannelSliderTrack />
            <ColorPicker.ChannelSliderThumb />
          </ColorPicker.ChannelSlider>
          <ColorPicker.View format="rgba">
            <ColorPicker.ChannelSlider channel="hue">
              <ColorPicker.ChannelSliderTrack />
              <ColorPicker.ChannelSliderThumb />
            </ColorPicker.ChannelSlider>
          </ColorPicker.View>
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );
    const red = screen.getByRole("slider", { name: "red" });
    expect(red.getAttribute("aria-valuenow")).toBe("255");
    expect(screen.getByRole("slider", { name: "hue" }).getAttribute("aria-valuenow")).toBe("0");

    fireEvent.keyDown(red, { key: "ArrowLeft" });

    expect(formatColor(onValueChange.mock.lastCall?.[0], "rgba")).toBe("rgba(254, 0, 0, 1)");
  });

  it("shows a swatch checked again once the hue comes back to it", () => {
    render(
      <ColorPicker.Root
        inline
        defaultValue={parseColor("#FF0000")}
      >
        <ColorPicker.Content>
          <ColorPicker.ChannelSlider channel="hue">
            <ColorPicker.ChannelSliderTrack />
            <ColorPicker.ChannelSliderThumb />
          </ColorPicker.ChannelSlider>
          <ColorPicker.SwatchTrigger value="#FF0000" />
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );
    const thumb = screen.getByRole("slider", { name: "hue" });

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });

    expect(
      screen
        .getByRole("button", { name: "select #FF0000 as the color" })
        .hasAttribute("data-checked"),
    ).toBe(true);
  });

  it("writes a format change's valueAsString in the new format", () => {
    const onValueChange = vi.fn();
    const color = parseColor("#336699");
    render(
      <ColorPicker.Root
        inline
        defaultValue={color}
        onValueChange={onValueChange}
      >
        <ColorPicker.Content>
          <ColorPicker.FormatTrigger />
        </ColorPicker.Content>
      </ColorPicker.Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "change color format to hsba" }));

    expect(onValueChange.mock.lastCall?.[1].valueAsString).toBe(formatColor(color, "hsba"));
  });

  describe("dragging", () => {
    afterEach(() => vi.restoreAllMocks());

    const stubRects = () =>
      vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockReturnValue({ x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 } as DOMRect);
    const area = () => document.querySelector('[data-slot="area"]') as HTMLElement;

    it("calls no onValueChangeEnd for a press that leaves the color as it was", async () => {
      stubRects();
      const onValueChangeEnd = vi.fn();
      render(
        <ColorPicker.Root
          inline
          defaultValue={parseColor("hsb(0, 50%, 50%)")}
          onValueChangeEnd={onValueChangeEnd}
        >
          <ColorPicker.Content>
            <ColorPicker.Area>
              <ColorPicker.AreaBackground />
              <ColorPicker.AreaThumb />
            </ColorPicker.Area>
          </ColorPicker.Content>
        </ColorPicker.Root>,
      );

      fireEvent.pointerDown(area(), { button: 0, clientX: 50, clientY: 50 });
      await act(async () => fireEvent.pointerUp(document));

      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });

    it("keeps the color as a press grabs the area thumb off centre, and drags from that grip", () => {
      stubRects();
      const onValueChange = vi.fn();
      render(
        <ColorPicker.Root
          inline
          defaultValue={parseColor("hsb(0, 50%, 50%)")}
          onValueChange={onValueChange}
        >
          <ColorPicker.Content>
            <ColorPicker.Area>
              <ColorPicker.AreaBackground />
              <ColorPicker.AreaThumb />
            </ColorPicker.Area>
          </ColorPicker.Content>
        </ColorPicker.Root>,
      );

      fireEvent.pointerDown(screen.getByRole("slider"), { button: 0, clientX: 60, clientY: 40 });
      expect(onValueChange).not.toHaveBeenCalled();

      fireEvent.pointerMove(document, { clientX: 70, clientY: 30, buttons: 1 });
      expect(formatColor(onValueChange.mock.lastCall?.[0], "hsba")).toBe("hsba(0, 60%, 60%, 1)");
    });

    it("ends the drag when the popup closes under it", async () => {
      stubRects();
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      render(
        <ColorPicker
          defaultOpen
          defaultValue={parseColor("hsb(210, 50%, 50%)")}
          onValueChange={onValueChange}
          onValueChangeEnd={onValueChangeEnd}
        />,
      );
      await act(async () => {});

      fireEvent.pointerDown(area(), { button: 0, clientX: 25, clientY: 25 });
      fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
      await act(async () => {});
      fireEvent.pointerMove(document, { clientX: 90, clientY: 10, buttons: 1 });
      await act(async () => fireEvent.pointerUp(document));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChangeEnd.mock.calls.map(([, details]) => details.valueAsString)).toEqual([
        "hsba(210, 25%, 75%, 1)",
      ]);
    });
  });

  describe("on phones", () => {
    useFakeTime();

    it("keeps its sheet open on an outside tap that onOpenChange cancels", async () => {
      // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
      const user = setupUser({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      mockMatchMedia(viewportWidth(375));
      render(
        <ColorPicker.Root
          defaultOpen
          onOpenChange={(_open, details) => details.cancel()}
        >
          <ColorPicker.Content>Body</ColorPicker.Content>
        </ColorPicker.Root>,
      );
      await settle();

      await user.click(document.querySelector("dialog") as Element);

      await settle();
      expect(screen.queryByText("Body")).not.toBeNull();
    });
  });
});
