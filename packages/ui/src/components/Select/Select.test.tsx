import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

afterEach(() => {
  cleanup();
});

describe("Select", () => {
  it("stretches content to the trigger width when contentWidth is not provided", async () => {
    const originalClientWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientWidth",
    );

    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 320;
      },
    });

    const items = [
      { label: "First filter", value: "1" },
      { label: "Second filter", value: "2" },
    ];

    try {
      render(
        <Select.Root
          getLabel={(item) => item.label}
          getValue={(item) => item.value}
          items={items}
          onSelect={vi.fn()}
          open
          selected={undefined}
        >
          <Select.Trigger label="Filter" />
          <Select.Content data-testid="select-content">
            <Select.List>
              <Select.Items>
                {(item: (typeof items)[number]) => (
                  <Select.Item
                    key={item.value}
                    item={item}
                  >
                    <Select.ItemText />
                  </Select.Item>
                )}
              </Select.Items>
            </Select.List>
          </Select.Content>
        </Select.Root>,
      );

      expect(screen.getByTestId("select-content").className).toContain("w_320");
    } finally {
      if (originalClientWidth != null) {
        Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
      }
    }
  });

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
              {(item: (typeof items)[number]) => (
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
