import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { commands } from "vitest/browser";

import { Carousel } from ".";

it("leaves the slides under a finger that holds still mid-swipe, and settles once it lifts", async () => {
  const onValueChange = vi.fn();
  render(
    <Carousel.Root
      slideCount={3}
      orientation="vertical"
      onValueChange={onValueChange}
    >
      <Carousel.ItemGroup style={{ height: 200 }}>
        {["One", "Two", "Three"].map((label, index) => (
          <Carousel.Item
            key={label}
            index={index}
          >
            <div style={{ height: 200 }}>{label}</div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
    </Carousel.Root>,
  );
  let changesAtLift = -1;
  document.addEventListener(
    "touchend",
    () => {
      changesAtLift = onValueChange.mock.calls.length;
    },
    { capture: true, once: true },
  );

  await commands.touchSwipe("text=One", -130, 400);

  expect(changesAtLift).toBe(0);
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe(1);
});
