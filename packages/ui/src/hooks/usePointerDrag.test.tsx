import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, onTestFinished, vi } from "vitest";

import { type UsePointerDragOptions, usePointerDrag } from "./usePointerDrag";

function Handle(options: UsePointerDragOptions<HTMLDivElement>) {
  const { onPointerDown } = usePointerDrag(options);
  return (
    <div
      data-testid="handle"
      onPointerDown={onPointerDown}
    />
  );
}

const mouse = { pointerId: 1, pointerType: "mouse" };

const press = () => {
  const handle = screen.getByTestId("handle");
  handle.setPointerCapture = () => {};
  fireEvent.pointerDown(handle, { ...mouse, isPrimary: true, button: 0, buttons: 1 });
};

const pointer = (type: string, init: PointerEventInit) =>
  document.dispatchEvent(new PointerEvent(type, { ...mouse, bubbles: true, ...init }));

it("reports the release of a press that never became a drag", () => {
  const onEnd = vi.fn();
  const onRelease = vi.fn();
  render(
    <Handle
      threshold={4}
      onMove={() => {}}
      onEnd={onEnd}
      onRelease={onRelease}
    />,
  );

  press();
  pointer("pointermove", { buttons: 1, clientX: 2 });
  pointer("pointerup", { buttons: 0 });

  expect(onEnd).not.toHaveBeenCalled();
  expect(onRelease).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
    dragged: false,
    cancelled: false,
  });
});

it("ends a mouse drag whose release never arrived at the next move without a button", () => {
  const onMove = vi.fn();
  const onEnd = vi.fn();
  const onRelease = vi.fn();
  render(
    <Handle
      onMove={onMove}
      onEnd={onEnd}
      onRelease={onRelease}
    />,
  );

  press();
  pointer("pointermove", { buttons: 1, clientX: 20 });
  pointer("pointermove", { buttons: 0, clientX: 40 });
  pointer("pointermove", { buttons: 0, clientX: 60 });

  expect(onMove).toHaveBeenCalledTimes(1);
  expect(onEnd).toHaveBeenCalledExactlyOnceWith(expect.anything(), { cancelled: false });
  expect(onRelease).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
    dragged: true,
    cancelled: false,
  });
});

it("on iOS holds text selection from the drag's start until just after its release", () => {
  vi.useFakeTimers();
  vi.spyOn(navigator, "platform", "get").mockReturnValue("iPhone");
  onTestFinished(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  const userSelect = () => document.documentElement.style.webkitUserSelect;
  render(
    <Handle
      threshold={4}
      onMove={() => {}}
    />,
  );

  press();
  pointer("pointermove", { buttons: 1, clientX: 2 });
  const whilePressed = userSelect();
  pointer("pointermove", { buttons: 1, clientX: 20 });
  const whileDragging = userSelect();
  pointer("pointerup", { buttons: 0 });
  vi.advanceTimersByTime(300);

  expect([whilePressed, whileDragging, userSelect()]).toEqual(["", "none", ""]);
});
