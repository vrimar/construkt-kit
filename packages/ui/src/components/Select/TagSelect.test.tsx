import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagSelect } from "./TagSelect";

afterEach(() => {
  cleanup();
});

describe("TagSelect", () => {
  it("does not select an item when clicking a rendered action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onSelect = vi.fn();
    const items = [
      { label: "United States", value: "us" },
      { label: "Canada", value: "ca" },
    ];

    render(
      <TagSelect
        getLabel={(item) => item.label}
        getValue={(item) => item.value}
        items={items}
        onSelect={onSelect}
        open
        selected={[]}
        renderActions={(item) => (
          <button
            aria-label={`Open actions for ${item.label}`}
            type="button"
            onClick={() => onAction(item.value)}
          >
            Action
          </button>
        )}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open actions for United States" }));

    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledWith("us");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
