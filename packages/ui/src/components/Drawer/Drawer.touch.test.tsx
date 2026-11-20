import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { commands } from "vitest/browser";

import { Drawer } from ".";

const settled = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 600)));

it("rests in place when it opens again while closing during a swipe", async () => {
  const drawer = (open: boolean) => (
    <Drawer.Root
      open={open}
      title="Filters"
    >
      <Drawer.Content>
        <Drawer.Body>Swipe me</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
  const { rerender } = render(drawer(true));
  const dialog = await screen.findByRole("dialog", { name: "Filters" });
  await settled();
  const content = dialog.querySelector<HTMLElement>('[data-slot="content"]');
  const rest = content?.style.transform;

  const swipe = commands.touchSwipeX("text=Swipe me", (content?.offsetWidth ?? 0) * 0.5, 1000);
  await expect.poll(() => content?.style.transform).not.toBe(rest);
  rerender(drawer(false));
  rerender(drawer(true));
  await swipe;
  await settled();

  expect(content?.style.transform).toBe(rest);
});
