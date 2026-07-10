import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagSelect } from "./TagSelect";

const items = [
  { id: 1, label: "One" },
  { id: 2, label: "Two" },
];

afterEach(cleanup);

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
