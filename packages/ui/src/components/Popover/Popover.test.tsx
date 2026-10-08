import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Popover, type PopoverRootProps } from "./Popover";

const renderOpen = async (props: Omit<PopoverRootProps, "children">) => {
  render(
    <Popover.Root
      open
      {...props}
    >
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>Body</Popover.Content>
    </Popover.Root>,
  );
  const content = screen.getByText("Body");
  const positioner = content.parentElement;
  await waitFor(() => expect(positioner?.style.getPropertyValue("--x")).not.toBe(""));
  return { placement: content.getAttribute("data-placement"), positioner };
};

describe("Popover", () => {
  it("keeps placement when positioning is passed", async () => {
    const { placement, positioner } = await renderOpen({
      placement: "left",
      positioning: { gutter: 4 },
    });

    expect(placement).toBe("left");
    expect(positioner?.style.getPropertyValue("--x")).toBe("-4px");
  });

  it("uses positioning.placement when placement is omitted", async () => {
    const { placement } = await renderOpen({ positioning: { placement: "right" } });

    expect(placement).toBe("right");
  });

  it("prefers placement over positioning.placement", async () => {
    const { placement } = await renderOpen({
      placement: "top",
      positioning: { placement: "right" },
    });

    expect(placement).toBe("top");
  });
});
