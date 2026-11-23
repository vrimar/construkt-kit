import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { commands } from "vitest/browser";

import { Sheet } from ".";
import { settled } from "../../_shared/settled";

it("settles back after a short swipe down its body and closes after a long one", async () => {
  render(
    <Sheet.Root
      defaultOpen
      title="Filters"
    >
      <Sheet.Content>
        <Sheet.Body>
          <p>Swipe me</p>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>,
  );
  const dialog = await screen.findByRole("dialog", { name: "Filters" });
  await settled();

  await commands.touchDrag("text=Swipe me", 0, 24, 120);
  await settled();
  expect(dialog.isConnected).toBe(true);

  const height = dialog.querySelector('[data-slot="content"]')?.getBoundingClientRect().height ?? 0;
  await commands.touchDrag("text=Swipe me", 0, height * 0.8, 120);
  await settled();
  expect(screen.queryByRole("dialog", { name: "Filters" })).toBeNull();
});
