import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Carousel } from ".";

describe("Carousel", () => {
  it("leaves a mouse press anywhere inside a control on a slide to the control", () => {
    render(
      <Carousel.Root
        slideCount={1}
        allowMouseDrag
      >
        <Carousel.ItemGroup>
          <Carousel.Item index={0}>
            <button type="button">
              <svg data-testid="icon" />
            </button>
          </Carousel.Item>
        </Carousel.ItemGroup>
      </Carousel.Root>,
    );

    expect(fireEvent.mouseDown(screen.getByTestId("icon"))).toBe(true);
  });
});
