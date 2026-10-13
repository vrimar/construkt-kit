import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip, type TooltipProps } from ".";

const renderOpen = async (props: Omit<TooltipProps, "children" | "label">) => {
  render(
    <Tooltip
      open
      label="Tip"
      {...props}
    >
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const content = screen.getByText("Tip");
  const positioner = content.parentElement;
  await waitFor(() => expect(positioner?.style.getPropertyValue("--x")).not.toBe(""));
  return { placement: content.getAttribute("data-placement"), positioner };
};

describe("Tooltip", () => {
  it("keeps placement when positioning is passed", async () => {
    const { placement, positioner } = await renderOpen({
      placement: "left",
      positioning: { gutter: 4 },
    });

    expect(placement).toBe("left");
    expect(positioner?.style.getPropertyValue("--x")).toBe("-4px");
  });

  it("places on top by default, even with positioning", async () => {
    const { placement } = await renderOpen({ positioning: { gutter: 4 } });

    expect(placement).toBe("top");
  });

  it("lets positioning.placement replace the default", async () => {
    const { placement } = await renderOpen({ positioning: { placement: "right" } });

    expect(placement).toBe("right");
  });

  it("wraps text children in a trigger element", () => {
    render(
      <Tooltip
        open
        label="Jane Doe"
      >
        Jane D.
      </Tooltip>,
    );

    const trigger = screen.getByText("Jane D.");
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger.getAttribute("data-part")).toBe("trigger");
    expect(screen.getByText("Jane Doe")).not.toBeNull();
  });

  it.each([null, undefined, false, ""])("renders bare children for label %o", (label) => {
    render(
      <Tooltip
        open
        label={label}
      >
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole("button", { name: "Trigger" }).hasAttribute("data-scope")).toBe(false);
    expect(document.querySelector("[data-scope='tooltip']")).toBeNull();
  });
});
