import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type MouseEvent as ReactMouseEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { createListCollection, Listbox } from ".";
import { encodedValues, groupLabels, optionValues, produce } from "./selection.fixtures";
import { encodeSelectionValue } from "./useSelectionController";

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
] as const;

const highlightedValue = () =>
  document.querySelector("[role='option'][data-highlighted]")?.getAttribute("data-value");

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

  it("renders group headings and nests items under their group", () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(2);
    expect(groupLabels()).toEqual(["Fruit", "Vegetable"]);
    expect(within(groups[0]).getByText("Banana")).not.toBeNull();
    expect(within(groups[1]).queryByText("Apple")).toBeNull();
    expect(optionValues()).toEqual(encodedValues(1, 3, 2));
    expect(groups[0].getAttribute("aria-labelledby")).toBe(
      groups[0].querySelector("[data-part='item-group-label']")?.id,
    );
  });

  it("orders group headings with groupSort", () => {
    const { rerender } = render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort="desc"
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );
    expect(groupLabels()).toEqual(["Vegetable", "Fruit"]);

    rerender(
      <Listbox
        items={[...produce]}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort={["Vegetable", "Fruit"]}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );
    expect(groupLabels()).toEqual(["Vegetable", "Fruit"]);
    expect(optionValues()).toEqual(encodedValues(2, 1, 3));
  });

  it("keeps grouping while searching and drops emptied groups", async () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Search..."), "Ban");
    expect(groupLabels()).toEqual(["Fruit"]);
    expect(optionValues()).toEqual(encodedValues(3));
    expect(screen.queryByText("Carrot")).toBeNull();
  });

  it("navigates in group order rather than item order", async () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    await userEvent.tab();
    expect(screen.getByRole("listbox")).toBe(document.activeElement);
    expect(highlightedValue()).toBe(encodeSelectionValue(1));
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(encodeSelectionValue(3));
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(encodeSelectionValue(2));
    await userEvent.keyboard("{Home}");
    expect(highlightedValue()).toBe(encodeSelectionValue(1));
    await userEvent.keyboard("{End}");
    expect(highlightedValue()).toBe(encodeSelectionValue(2));
    await userEvent.keyboard("{ArrowUp}");
    expect(highlightedValue()).toBe(encodeSelectionValue(3));
  });

  it("ignores virtualization while grouped but keeps the height capped", () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search={false}
        virtual
      />,
    );

    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(document.querySelector("[data-index]")).toBeNull();
    expect(screen.getByRole("listbox").className).toContain("max-h_20rem");
  });

  it("keeps navigation order matching render order when groupBy toggles off", async () => {
    const view = (groupBy?: (item: (typeof produce)[number]) => string) => (
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={groupBy}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />
    );
    const { rerender } = render(view((item) => item.kind));
    rerender(view(undefined));

    const rendered = optionValues();
    await userEvent.tab();
    expect(highlightedValue()).toBe(rendered[0]);
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(rendered[1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(rendered[2]);
  });

  it("omits the heading for an empty group key", () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => (item.kind === "Fruit" ? "" : item.kind)}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(groupLabels()).toEqual([null, "Vegetable"]);
  });

  it("renders group headings through renderGroupLabel", () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        renderGroupLabel={(group, groupItems) => `${group} (${groupItems.length})`}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    expect(groupLabels()).toEqual(["Fruit (2)", "Vegetable (1)"]);
  });

  it("shows only the empty state when a grouped collection has no items", () => {
    render(
      <Listbox
        items={[] as typeof produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    expect(screen.queryAllByRole("group")).toHaveLength(0);
    expect(screen.getByText("No items available")).not.toBeNull();
  });

  it("keeps grouping props off the DOM", () => {
    render(
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort={["Vegetable", "Fruit"]}
        renderGroupLabel={(group) => group}
        value={null}
        onValueChange={vi.fn()}
        search={false}
      />,
    );

    const root = screen.getByRole("listbox").closest("[data-scope='listbox'][data-part='root']");
    expect(root?.hasAttribute("groupby")).toBe(false);
    expect(root?.hasAttribute("groupsort")).toBe(false);
    expect(root?.hasAttribute("rendergrouplabel")).toBe(false);
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
          {collection.group().map(([region, regionItems]) => (
            <Listbox.ItemGroup key={region}>
              <Listbox.ItemGroupLabel>{region}</Listbox.ItemGroupLabel>
              {regionItems.map((item) => (
                <Listbox.Item
                  key={item.value}
                  item={item}
                >
                  <Listbox.ItemText>{item.label}</Listbox.ItemText>
                </Listbox.Item>
              ))}
            </Listbox.ItemGroup>
          ))}
        </Listbox.Content>
      </Listbox.Root>,
    );
    expect(groupLabels()).toEqual(["Americas"]);
    expect(optionValues()).toEqual(["north", "south"]);
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
