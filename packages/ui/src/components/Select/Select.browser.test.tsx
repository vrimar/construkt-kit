import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Select } from "./Select";

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
];

it("shows no highlight on a list opened with the mouse until a key moves it", async () => {
  render(
    <Select
      items={fruits}
      getItemValue={(item) => item.id}
      getItemLabel={(item) => item.name}
      value={null}
      onValueChange={() => {}}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: "Select item" }));
  const list = await screen.findByRole("listbox");
  await expect.poll(() => document.activeElement).toBe(list);
  expect(list.querySelector("[data-highlighted]")).toBeNull();

  await userEvent.keyboard("{ArrowDown}");
  expect(list.querySelector("[data-highlighted]")?.textContent).toBe("Banana");
});
