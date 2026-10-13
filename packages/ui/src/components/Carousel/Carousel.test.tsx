import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Carousel, type CarouselRootProps } from ".";

const renderCarousel = (props: Partial<CarouselRootProps> = {}) => {
  const { container } = render(
    <Carousel.Root
      slideCount={2}
      {...props}
    >
      <Carousel.ItemGroup>
        <Carousel.Item index={0}>One</Carousel.Item>
        <Carousel.Item index={1}>Two</Carousel.Item>
      </Carousel.ItemGroup>
    </Carousel.Root>,
  );
  return {
    root: container.querySelector<HTMLElement>("[data-part='root']"),
    itemGroup: container.querySelector<HTMLElement>("[data-part='item-group']"),
  };
};

describe("Carousel", () => {
  it("spaces slides with a CSS length by default", () => {
    const { root } = renderCarousel();

    expect(root?.style.getPropertyValue("--slide-spacing")).toBe("var(--spacing-4)");
  });

  it("hands padding to the machine instead of styling the root", () => {
    const { root, itemGroup } = renderCarousel({ padding: "20px" });

    expect(root?.className).not.toMatch(/\bp_/);
    expect(itemGroup?.getAttribute("style")).toContain("20px");
  });
});
