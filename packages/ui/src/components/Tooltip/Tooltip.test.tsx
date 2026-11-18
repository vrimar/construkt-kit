import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip, TooltipGroup, type TooltipProps } from ".";
import { advance, setupUser, useFakeTime } from "../../_shared/fakeTime";

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

describe("Tooltip showWhenTruncated", () => {
  useFakeTime();

  it.each([
    { state: "cut off", scrollWidth: 240, opens: true },
    { state: "fully shown", scrollWidth: 120, opens: false },
  ])("opens on hover only when the text is $state", async ({ scrollWidth, opens }) => {
    const user = setupUser();
    render(
      <Tooltip
        label="Quarterly revenue by region"
        showWhenTruncated
      >
        <button type="button">
          <span style={{ overflow: "hidden" }}>Quarterly revenue by region</span>
        </button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button");
    const text = trigger.firstElementChild as HTMLElement;
    Object.defineProperty(text, "scrollWidth", { configurable: true, value: scrollWidth });
    Object.defineProperty(text, "clientWidth", { configurable: true, value: 120 });

    await user.hover(trigger);
    await advance(1000);

    expect(screen.queryByRole("tooltip") != null).toBe(opens);
  });
});

describe("TooltipGroup", () => {
  useFakeTime();

  it("moves the one shared tooltip to the hovered trigger, label and description", async () => {
    const user = setupUser();
    render(
      <TooltipGroup>
        <Tooltip label="First tip">
          <button type="button">First</button>
        </Tooltip>
        <Tooltip label="Second tip">
          <button type="button">Second</button>
        </Tooltip>
      </TooltipGroup>,
    );

    await user.hover(screen.getByRole("button", { name: "First" }));
    await advance(1000);
    await user.hover(screen.getByRole("button", { name: "Second" }));
    await advance(1000);

    expect(screen.getByRole("tooltip").textContent).toBe("Second tip");
    expect(screen.getByRole("button", { name: "Second" }).getAttribute("aria-describedby")).toBe(
      screen.getByRole("tooltip").id,
    );
    expect(screen.getByRole("button", { name: "First" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
  });
});
