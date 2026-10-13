import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";
import { TagSelect, type TagSelectProps } from "./TagSelect";

const items = [
  { id: 1, label: "One" },
  { id: 2, label: "Two" },
];

type Item = (typeof items)[number];

const itemProps = {
  items,
  getItemValue: (item: Item) => item.id,
  getItemLabel: (item: Item) => item.label,
};

type TagSelectOverrides = Partial<TagSelectProps<Item, number>>;

const renderTagSelect = (props?: TagSelectOverrides) => {
  const element = (overrides: TagSelectOverrides = {}) => (
    <TagSelect
      {...itemProps}
      value={[]}
      onValueChange={vi.fn()}
      {...overrides}
    />
  );
  const view = render(element(props));
  return { ...view, rerender: (next?: TagSelectOverrides) => view.rerender(element(next)) };
};

describe("TagSelect", () => {
  it("renders numeric selected IDs through the typed item map", () => {
    renderTagSelect({ value: [1], renderTag: (item) => <span>Tag {item.label}</span> });
    expect(screen.getByText("Tag One")).not.toBeNull();
  });

  it("shows the default placeholder when nothing is selected", () => {
    renderTagSelect();
    expect(screen.getByText("Select item")).not.toBeNull();
  });

  it("shows a custom placeholder until an item is selected", () => {
    const { rerender } = renderTagSelect({ placeholder: "Pick items" });
    expect(screen.getByText("Pick items")).not.toBeNull();

    rerender({ value: [1], placeholder: "Pick items" });
    expect(screen.queryByText("Pick items")).toBeNull();
  });

  it("labels ids missing from items the way Select does", () => {
    render(
      <>
        <Select
          {...itemProps}
          selectionMode="multiple"
          value={[3]}
          onValueChange={vi.fn()}
          placeholder="Pick items"
        />
        <TagSelect
          {...itemProps}
          value={[3]}
          onValueChange={vi.fn()}
          placeholder="Pick items"
        />
      </>,
    );
    expect(screen.getAllByText("1 selected")).toHaveLength(2);
    expect(screen.queryByText("Pick items")).toBeNull();
  });

  it("opens the list from the tag trigger", async () => {
    renderTagSelect({ value: [1], search: false });
    expect(screen.queryByRole("option")).toBeNull();
    await userEvent.click(screen.getByText("One"));
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it.each(["{Enter}", " ", "{ArrowDown}"])(
    "opens the list from the keyboard with %s",
    async (key) => {
      renderTagSelect({ value: [1], search: false });

      await userEvent.tab();
      const trigger = screen.getByRole("button", { name: "One" });
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      await userEvent.keyboard(key);
      expect(screen.getAllByRole("option")).toHaveLength(2);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    },
  );

  it("takes a single tab stop", async () => {
    render(
      <>
        <TagSelect
          {...itemProps}
          value={[1]}
          onValueChange={vi.fn()}
        />
        <button type="button">After</button>
      </>,
    );

    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  });

  it("keeps typing in the search input after an option is clicked", async () => {
    const onValueChange = vi.fn();
    renderTagSelect({ onValueChange, open: true });
    const input = screen.getByRole<HTMLInputElement>("textbox");

    await userEvent.click(input);
    await userEvent.click(screen.getByRole("option", { name: "One" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith([1]);
    expect(document.activeElement).toBe(input);

    await userEvent.keyboard("tw");
    expect(input.value).toBe("tw");
    expect(screen.queryByRole("option", { name: "One" })).toBeNull();
  });
});
