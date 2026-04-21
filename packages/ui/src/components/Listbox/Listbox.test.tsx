import { createListCollection } from "@ark-ui/react/collection";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Listbox } from ".";

afterEach(() => {
  cleanup();
});

describe("Listbox", () => {
  it("does not select an item when clicking a rendered action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onValueChange = vi.fn();
    const collection = createListCollection({
      items: [
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
      ],
    });

    render(
      <Listbox
        collection={collection}
        onValueChange={onValueChange}
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
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByText("United States"));

    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it("renders list content inside a scroll area", () => {
    const collection = createListCollection({
      items: [
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
      ],
    });

    const { container } = render(<Listbox collection={collection} />);

    expect(container.querySelector('[data-scope="scroll-area"][data-part="root"]')).not.toBeNull();
  });

  it("does not select an item when using the primitive item API with an action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onValueChange = vi.fn();
    const collection = createListCollection({
      items: [
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
      ],
    });

    render(
      <Listbox.Root
        collection={collection}
        onValueChange={onValueChange}
      >
        <Listbox.Content>
          {collection.items.map((item) => (
            <Listbox.Item
              key={item.value}
              item={item}
            >
              <Listbox.ItemText>{item.label}</Listbox.ItemText>
              <div data-listbox-item-action="">
                <button
                  aria-label={`Primitive actions for ${item.label}`}
                  type="button"
                  onClick={() => onAction(item.value)}
                >
                  Action
                </button>
              </div>
              <Listbox.ItemIndicator />
            </Listbox.Item>
          ))}
        </Listbox.Content>
      </Listbox.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Primitive actions for United States" }));

    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledWith("us");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
