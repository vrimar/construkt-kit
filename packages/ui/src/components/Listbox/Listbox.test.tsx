import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type MouseEvent as ReactMouseEvent, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createListCollection, Listbox } from ".";

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
] as const;

afterEach(cleanup);

describe("Listbox", () => {
  it("emits the complete native numeric value in single mode", async () => {
    const onValueChange = vi.fn();
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={onValueChange}
        search={false}
      />,
    );

    await userEvent.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("emits the complete next array in multiple mode", async () => {
    const onValueChange = vi.fn();
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        selectionMode="multiple"
        value={[1]}
        onValueChange={onValueChange}
        search={false}
      />,
    );

    await userEvent.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith([1, 2]);
  });

  it("filters with the built-in search", async () => {
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        search={{ placeholder: "Find fruit" }}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Find fruit"), "ban");
    expect(screen.getByText("Banana")).not.toBeNull();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("reacts to externally controlled queries while hiding the input", () => {
    const { rerender } = render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        search={{ query: "app", showInput: false }}
      />,
    );

    expect(screen.getByText("Apple")).not.toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();

    rerender(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        search={{ query: "ban", showInput: false }}
      />,
    );

    expect(screen.getByText("Banana")).not.toBeNull();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("keeps numeric and string IDs distinct", async () => {
    const items = [
      { id: 1 as string | number, label: "Number" },
      { id: "1" as string | number, label: "String" },
    ];
    const onValueChange = vi.fn();
    render(
      <Listbox
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={1}
        onValueChange={onValueChange}
        search={false}
      />,
    );

    await userEvent.click(screen.getByText("String"));
    expect(onValueChange).toHaveBeenCalledWith("1");
  });

  it("supports falsey primitive items", () => {
    render(
      <Listbox
        items={[0, 1]}
        getItemValue={(item) => item}
        getItemLabel={(item) => String(item)}
        value={0}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    expect(screen.getByText("0")).not.toBeNull();
  });

  it("throws for duplicate typed IDs", () => {
    expect(() =>
      render(
        <Listbox
          items={[
            { id: 1, label: "One" },
            { id: 1, label: "Duplicate" },
          ]}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.label}
          value={null}
          onValueChange={vi.fn()}
        />,
      ),
    ).toThrow(/unique values/i);
  });

  it("renders custom item content and action content", () => {
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        search={false}
        renderItem={(item) => <span>Fruit: {item.name}</span>}
        renderItemActions={(item) => <button type="button">Edit {item.name}</button>}
      />,
    );

    expect(screen.getByText("Fruit: Apple")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Edit Apple" })).not.toBeNull();
  });

  it("does not select an item when its action is clicked", async () => {
    const onValueChange = vi.fn();
    const onAction = vi.fn();
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={onValueChange}
        search={false}
        renderItemActions={() => (
          <button
            type="button"
            onClick={onAction}
          >
            Edit
          </button>
        )}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(onAction).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("does not cancel an item action link's native default", async () => {
    const onValueChange = vi.fn();
    const onLinkClick = vi.fn((event: ReactMouseEvent<HTMLAnchorElement>) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault();
    });
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={onValueChange}
        search={false}
        renderItemActions={() => (
          <a
            href="/fruit"
            onClick={onLinkClick}
          >
            View
          </a>
        )}
      />,
    );

    await userEvent.click(screen.getAllByRole("link", { name: "View" })[0]);
    expect(onLinkClick).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports indicator placement through the recipe", () => {
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={1}
        onValueChange={vi.fn()}
        indicatorPosition="start"
        search={false}
      />,
    );

    expect(screen.getByRole("listbox").className).toContain(
      "listbox__content--indicatorPosition_start",
    );
  });

  it("suppresses the empty state while loading", () => {
    render(
      <Listbox
        items={[] as { id: number; name: string }[]}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        loading
        search={false}
      />,
    );
    expect(screen.queryByText("No items available")).toBeNull();
  });

  it("keeps the advanced collection API on Listbox.Root", () => {
    const collection = createListCollection({
      items: [
        { label: "North", value: "north", region: "Americas" },
        { label: "South", value: "south", region: "Americas" },
      ],
      groupBy: (item) => item.region,
    });

    render(
      <Listbox.Root collection={collection}>
        <Listbox.Content>
          <Listbox.ItemGroup>
            <Listbox.ItemGroupLabel>Americas</Listbox.ItemGroupLabel>
          </Listbox.ItemGroup>
        </Listbox.Content>
      </Listbox.Root>,
    );
    expect(screen.getByText("Americas")).not.toBeNull();
  });

  it("renders content inside a scroll area", () => {
    render(
      <Listbox
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );
    expect(screen.getByRole("listbox").closest("[data-scope='scroll-area']")).not.toBeNull();
  });

  it("allows controlled multiple state", async () => {
    function Example() {
      const [value, setValue] = useState<number[]>([]);
      return (
        <Listbox
          items={fruits}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.name}
          selectionMode="multiple"
          value={value}
          onValueChange={setValue}
          search={false}
        />
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText("Apple"));
    expect(screen.getByText("Apple").closest("[aria-selected='true']")).not.toBeNull();
  });
});
