import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TagSelect } from "./TagSelect";

const items = [
  { id: 1, label: "One" },
  { id: 2, label: "Two" },
];

describe("TagSelect", () => {
  it("renders numeric selected IDs through the typed item map", () => {
    render(
      <TagSelect
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={[1]}
        onValueChange={vi.fn()}
        renderTag={(item) => <span>Tag {item.label}</span>}
      />,
    );
    expect(screen.getByText("Tag One")).not.toBeNull();
  });

  it("opens the list from the tag trigger", async () => {
    render(
      <TagSelect
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={[1]}
        onValueChange={vi.fn()}
        search={false}
      />,
    );
    expect(screen.queryByRole("option")).toBeNull();
    await userEvent.click(screen.getByText("One"));
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("emits complete arrays when an item is toggled", async () => {
    const onValueChange = vi.fn();
    render(
      <TagSelect
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={[]}
        onValueChange={onValueChange}
        open
        search={false}
      />,
    );
    await userEvent.click(screen.getByText("One"));
    expect(onValueChange).toHaveBeenCalledWith([1]);
  });

  it("configures search through the shared option", async () => {
    render(
      <TagSelect
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={[]}
        onValueChange={vi.fn()}
        open
        search={{
          placeholder: "Find item",
          filter: (item, query) => item.label.toLowerCase().startsWith(query.toLowerCase()),
        }}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("Find item"), "t");
    expect(screen.getByText("Two")).not.toBeNull();
    expect(screen.queryByText("One")).toBeNull();
  });

  it("forwards grouping to the managed list", () => {
    render(
      <TagSelect
        items={[
          { id: 1, label: "Apple", kind: "Fruit" },
          { id: 2, label: "Carrot", kind: "Vegetable" },
          { id: 3, label: "Banana", kind: "Fruit" },
        ]}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        groupBy={(item) => item.kind}
        value={[]}
        onValueChange={vi.fn()}
        open
        search={false}
      />,
    );
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Apple",
      "Banana",
      "Carrot",
    ]);
  });

  it("keeps item actions from changing selection", async () => {
    const onValueChange = vi.fn();
    const onAction = vi.fn();
    render(
      <TagSelect
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={[]}
        onValueChange={onValueChange}
        open
        search={false}
        renderItemActions={(item) => (
          <button
            type="button"
            onClick={onAction}
          >
            Edit {item.label}
          </button>
        )}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit One" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
