import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Tooltip, TooltipGroup, useTooltipDelegate } from ".";
import { Menu } from "../Menu";
import { Popover } from "../Popover";

it("wraps text children in an element that the tooltip describes", async () => {
  render(<Tooltip label="Jane Doe">Jane D.</Tooltip>);
  const trigger = screen.getByText("Jane D.");

  await userEvent.hover(trigger);

  const tip = await screen.findByRole("tooltip");
  expect(trigger.tagName).toBe("SPAN");
  expect(trigger.getAttribute("aria-describedby")).toBe(tip.id);
});

it("keeps its trigger element and shows nothing while the label is empty", () => {
  const copy = (label: string) => (
    <Tooltip
      label={label}
      open
    >
      <button type="button">Copy</button>
    </Tooltip>
  );
  const { rerender } = render(copy(""));
  const trigger = screen.getByRole("button", { name: "Copy" });
  trigger.focus();

  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);

  rerender(copy("Copied"));

  expect(screen.getByRole("button", { name: "Copy" })).toBe(trigger);
  expect(document.activeElement).toBe(trigger);
  expect(screen.getByRole("tooltip").textContent).toBe("Copied");
});

it("lets presses through to what an open tooltip covers", async () => {
  render(
    <Tooltip
      label="Covers what is under it"
      defaultOpen
    >
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  const tip = await screen.findByRole("tooltip");
  await expect.poll(() => tip.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  const box = tip.getBoundingClientRect();

  const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);

  expect(hit).not.toBeNull();
  expect(tip.closest("[popover]")?.contains(hit)).toBe(false);
});

it.each([
  { state: "cut off", width: "5rem", opens: true },
  { state: "fully shown", width: "40rem", opens: false },
])("opens a showWhenTruncated tooltip only when the text is $state", async ({ width, opens }) => {
  render(
    <Tooltip
      label="Quarterly revenue by region"
      showWhenTruncated
    >
      <button
        type="button"
        style={{ width }}
      >
        <span style={{ display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
          Quarterly revenue by region
        </span>
      </button>
    </Tooltip>,
  );

  await userEvent.hover(screen.getByRole("button"));
  await new Promise((resolve) => setTimeout(resolve, 500));

  expect(screen.queryByRole("tooltip") != null).toBe(opens);
});

it("moves a group's one tooltip to the hovered trigger", async () => {
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

  await userEvent.hover(screen.getByRole("button", { name: "First" }));
  await screen.findByText("First tip");
  await userEvent.hover(screen.getByRole("button", { name: "Second" }));
  await expect.poll(() => screen.queryByRole("tooltip")?.textContent).toBe("Second tip");

  const tip = screen.getByRole("tooltip");
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Second" }).getAttribute("aria-describedby")).toBe(
    tip.id,
  );
  expect(screen.getByRole("button", { name: "First" }).hasAttribute("aria-describedby")).toBe(
    false,
  );
});

it("shows a group trigger's new label while its tooltip is open", async () => {
  const group = (label: string) => (
    <TooltipGroup>
      <Tooltip label={label}>
        <button type="button">Copy link</button>
      </Tooltip>
    </TooltipGroup>
  );
  const { rerender } = render(group("Copy"));
  await userEvent.hover(screen.getByRole("button", { name: "Copy link" }));
  await screen.findByText("Copy");

  rerender(group("Copied"));

  await expect.poll(() => screen.queryByRole("tooltip")?.textContent).toBe("Copied");
});

it.each([
  {
    surface: "Popover",
    element: (
      <Popover.Root>
        <Popover.Trigger tooltip="More">Open</Popover.Trigger>
        <Popover.Content>Body</Popover.Content>
      </Popover.Root>
    ),
  },
  {
    surface: "Menu",
    element: (
      <Menu.Root>
        <Menu.Trigger tooltip="More">Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ),
  },
])("keeps a $surface trigger's tooltip closed while it is open", async ({ element }) => {
  render(element);
  const trigger = screen.getByRole("button", { name: "Open" });

  await userEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  await userEvent.unhover(trigger);
  await userEvent.hover(trigger);
  await new Promise((resolve) => setTimeout(resolve, 500));

  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("lets a press on its trigger close a menu open elsewhere", async () => {
  render(
    <>
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <Tooltip label="Jane Doe">Jane D.</Tooltip>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Actions" }));
  await screen.findByRole("menu");
  const name = screen.getByText("Jane D.");
  await userEvent.hover(name);
  await screen.findByRole("tooltip");

  await userEvent.click(name);

  await expect.poll(() => screen.queryByRole("menu")).toBeNull();
});

it("closes when its trigger expands while it shows", async () => {
  const filter = (expanded: boolean) => (
    <Tooltip label="Filters">
      <button
        type="button"
        aria-expanded={expanded}
      >
        Filter
      </button>
    </Tooltip>
  );
  const { rerender } = render(filter(false));
  await userEvent.hover(screen.getByRole("button", { name: "Filter" }));
  await screen.findByRole("tooltip");

  rerender(filter(true));

  await expect.poll(() => screen.queryByRole("tooltip")).toBeNull();
});

function DelegatedTriggers() {
  const { show, showAfterDelay, tooltip } = useTooltipDelegate({
    openDelay: 60_000,
    placement: "bottom",
  });
  return (
    <>
      <button
        type="button"
        onFocus={(event) => show(event.currentTarget, "First tip")}
      >
        First
      </button>
      <button
        type="button"
        style={{ marginLeft: 400 }}
        onPointerEnter={(event) => showAfterDelay(event.currentTarget, "Second tip")}
      >
        Second
      </button>
      {tooltip}
    </>
  );
}

it("moves a delegated tooltip that shows to the next trigger without the delay", async () => {
  render(<DelegatedTriggers />);
  screen.getByRole("button", { name: "First" }).focus();
  await screen.findByText("First tip");
  const second = screen.getByRole("button", { name: "Second" });

  await userEvent.hover(second);

  await expect.poll(() => screen.queryByRole("tooltip")?.textContent).toBe("Second tip");
  const centerX = (box: DOMRect) => box.left + box.width / 2;
  await expect
    .poll(() =>
      Math.abs(
        centerX(screen.getByRole("tooltip").getBoundingClientRect()) -
          centerX(second.getBoundingClientRect()),
      ),
    )
    .toBeLessThan(1);
});
