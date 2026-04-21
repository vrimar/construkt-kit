import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

afterEach(() => {
  cleanup();
});

const items = [
  { label: "First filter", value: "1" },
  { label: "Second filter", value: "2" },
];

const getValue = (item: (typeof items)[number]) => item.value;
const getLabel = (item: (typeof items)[number]) => item.label;

describe("Select (compound API)", () => {
  it("applies explicit contentWidth to content", () => {
    render(
      <Select.Root
        getLabel={(item) => item.label}
        getValue={(item) => item.value}
        items={items}
        contentWidth={300}
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

    expect(screen.getByTestId("select-content").className).toContain("w_300");
  });

  it("does not set content width when matchTriggerWidth is false", () => {
    render(
      <Select.Root
        getLabel={(item) => item.label}
        getValue={(item) => item.value}
        items={items}
        matchTriggerWidth={false}
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

    const className = screen.getByTestId("select-content").className;
    expect(className).not.toMatch(/(?:^|\s)w_\d+/);
  });

  it("does not select an item when clicking an interactive descendant inside Select.Item", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onSelect = vi.fn();

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

describe("Select (simple API)", () => {
  it("renders items using the simple API", () => {
    render(
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={vi.fn()}
        label="Filter"
        open
      />,
    );

    expect(screen.getByText("First filter")).toBeDefined();
    expect(screen.getByText("Second filter")).toBeDefined();
  });

  it("renders a search input when searchPlaceholder is set", () => {
    render(
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={vi.fn()}
        label="Filter"
        searchPlaceholder="Search..."
        open
      />,
    );

    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("does not render a search input when searchPlaceholder is omitted", () => {
    render(
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={vi.fn()}
        label="Filter"
        open
      />,
    );

    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("renders empty state when items is empty", () => {
    render(
      <Select
        items={[]}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={vi.fn()}
        label="Filter"
        emptyMessage="Nothing here"
        open
      />,
    );

    expect(screen.getByText("Nothing here")).toBeDefined();
  });

  it("supports children escape hatch for compound usage", () => {
    render(
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={vi.fn()}
        open
      >
        <Select.Trigger label="Custom" />
        <Select.Content>
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
      </Select>,
    );

    expect(screen.getByText("First filter")).toBeDefined();
  });
});
