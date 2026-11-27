import { render, screen } from "@testing-library/react";
import { Activity, useState } from "react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Collapsible } from ".";

const content = () => document.querySelector<HTMLElement>(".collapsible__content");
const animations = () =>
  content()
    ?.getAnimations()
    .map((a) => (a as CSSAnimation).animationName);
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function Hideable() {
  const [shown, setShown] = useState(true);
  return (
    <>
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
      >
        Hide section
      </button>
      <Activity mode={shown ? "visible" : "hidden"}>
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger>Details</Collapsible.Trigger>
          <Collapsible.Content>Shipping takes three days.</Collapsible.Content>
        </Collapsible.Root>
      </Activity>
    </>
  );
}

it("reports its trigger collapsed as soon as it closes, while the content animates out", async () => {
  render(
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Details</Collapsible.Trigger>
      <Collapsible.Content>Shipping takes three days.</Collapsible.Content>
    </Collapsible.Root>,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  const contentWhenCollapsed = new Promise<HTMLElement | null>((resolve) => {
    const observer = new MutationObserver(() => {
      if (trigger.getAttribute("aria-expanded") !== "false") return;
      observer.disconnect();
      resolve(content());
    });
    observer.observe(trigger, { attributeFilter: ["aria-expanded"] });
  });

  await userEvent.click(trigger);

  expect(await contentWhenCollapsed).not.toBeNull();
});

it("animates only when it opens or closes, not when it mounts open or an ancestor shows it again", async () => {
  render(<Hideable />);
  const trigger = screen.getByRole("button", { name: "Details" });
  await nextFrame();
  expect(animations()).toEqual([]);

  await userEvent.click(trigger);
  expect(animations()).toEqual(["collapse-height", "fade-out"]);
  await expect.poll(content).toBeNull();

  await userEvent.click(trigger);
  const opening = content();
  expect(animations()).toEqual(["expand-height", "fade-in"]);
  expect(opening?.style.getPropertyValue("--collapsible-height")).toBe(
    `${opening?.scrollHeight}px`,
  );
  await expect.poll(animations).toEqual([]);

  const hide = screen.getByRole("button", { name: "Hide section" });
  await userEvent.click(hide);
  await userEvent.click(hide);
  await nextFrame();
  expect(animations()).toEqual([]);
});
