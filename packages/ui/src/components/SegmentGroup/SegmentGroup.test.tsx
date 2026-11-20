import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { SegmentGroup } from ".";

it("goes back to its initial value when the form its radios join through `form` resets", async () => {
  render(
    <>
      <form id="settings" />
      <SegmentGroup.Root
        form="settings"
        name="view"
        defaultValue="list"
      >
        <SegmentGroup.Items
          items={[
            { value: "list", label: "List" },
            { value: "grid", label: "Grid" },
          ]}
        />
      </SegmentGroup.Root>
    </>,
  );
  const form = document.getElementById("settings") as HTMLFormElement;
  await userEvent.click(screen.getByText("Grid"));
  expect(new FormData(form).get("view")).toBe("grid");

  act(() => form.reset());
  await act(() => new Promise(requestAnimationFrame));

  expect(new FormData(form).get("view")).toBe("list");
  expect(screen.getByText("List").closest("label")?.hasAttribute("data-checked")).toBe(true);
});
