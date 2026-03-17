import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

afterEach(() => {
  cleanup();
});

describe("Select", () => {
  it("does not select an item when clicking an interactive descendant inside Select.Item", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onSelect = vi.fn();
    const items = [
      { label: "First filter", value: "1" },
      { label: "Second filter", value: "2" },
    ];

    render(
      <Select.Root
        getLabel={(item) => item.label}
        getValue={(item) => item.value}
        items={items}
        onSelect={onSelect}
        open
        selected={undefined}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.List>
            <Select.Items>
              {(item) => (
                <Select.Item
                  key={item.value}
                  item={item}
                >
                  <Select.ItemText />
                  <div>
                    <button
                      aria-label={`Edit ${item.label}`}
                      type="button"
                      onClick={() => onAction(item.value)}
                    >
                      Edit
                    </button>
                  </div>
                </Select.Item>
              )}
            </Select.Items>
          </Select.List>
        </Select.Content>
      </Select.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Edit First filter" }));

    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledWith("1");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
