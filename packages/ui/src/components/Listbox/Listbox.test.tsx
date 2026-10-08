import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type MouseEvent as ReactMouseEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { createListCollection, Listbox, type ListboxProps, type SingleSelectionProps } from ".";
import {
  encodedValues,
  groupLabels,
  highlightedValue,
  optionValues,
  type Produce,
  produce,
  produceProps,
} from "./selection.fixtures";
import { encodeSelectionValue } from "./useSelectionController";

type ListboxOverrides = Partial<ListboxProps<Produce, number> & SingleSelectionProps<number>>;

const renderListbox = (props?: ListboxOverrides) => {
  const element = (overrides: ListboxOverrides = {}) => (
    <Listbox
      {...produceProps}
      value={null}
      onValueChange={vi.fn()}
      search={false}
      {...overrides}
    />
  );
  const view = render(element(props));
  return { ...view, rerender: (next?: ListboxOverrides) => view.rerender(element(next)) };
};

describe("Listbox", () => {
  it("filters with the built-in search", async () => {
    renderListbox({ search: { placeholder: "Find fruit" } });

    await userEvent.type(screen.getByPlaceholderText("Find fruit"), "ban");
    expect(screen.getByText("Banana")).not.toBeNull();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("reacts to externally controlled queries while hiding the input", () => {
    const { rerender } = renderListbox({ search: { query: "app", showInput: false } });

    expect(screen.getByText("Apple")).not.toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();

    rerender({ search: { query: "ban", showInput: false } });

    expect(screen.getByText("Banana")).not.toBeNull();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("leaves filtering to the consumer in external search mode", async () => {
    const onQueryChange = vi.fn();
    const filter = vi.fn(() => false);
    renderListbox({
      search: { mode: "external", placeholder: "Find fruit", onQueryChange, filter },
    });

    await userEvent.type(screen.getByPlaceholderText("Find fruit"), "ban");
    expect(onQueryChange).toHaveBeenLastCalledWith("ban");
    expect(screen.getByText("Apple")).not.toBeNull();
    expect(screen.getByText("Banana")).not.toBeNull();
    expect(filter).not.toHaveBeenCalled();
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
    renderListbox({
      renderItem: (item) => <span>Fruit: {item.name}</span>,
      renderItemActions: (item) => <button type="button">Edit {item.name}</button>,
    });

    expect(screen.getByText("Fruit: Apple")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Edit Apple" })).not.toBeNull();
  });

  it("does not cancel an item action link's native default", async () => {
    const onValueChange = vi.fn();
    const onLinkClick = vi.fn((event: ReactMouseEvent<HTMLAnchorElement>) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault();
    });
    renderListbox({
      onValueChange,
      renderItemActions: () => (
        <a
          href="/fruit"
          onClick={onLinkClick}
        >
          View
        </a>
      ),
    });

    await userEvent.click(screen.getAllByRole("link", { name: "View" })[0]);
    expect(onLinkClick).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("suppresses the empty state while loading", () => {
    renderListbox({ items: [], loading: true });
    expect(screen.queryByText("No items available")).toBeNull();
  });

  it("orders group headings with groupSort", () => {
    const { rerender } = renderListbox({ groupBy: (item) => item.kind, groupSort: "desc" });
    expect(groupLabels()).toEqual(["Vegetable", "Fruit"]);

    rerender({
      items: [...produce],
      groupBy: (item) => item.kind,
      groupSort: ["Vegetable", "Fruit"],
    });
    expect(groupLabels()).toEqual(["Vegetable", "Fruit"]);
    expect(optionValues()).toEqual(encodedValues(2, 1, 3));
  });

  it("navigates in group order rather than item order", async () => {
    renderListbox({ groupBy: (item) => item.kind });

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

  it("ignores virtualization while grouped", () => {
    renderListbox({ groupBy: (item) => item.kind, virtual: true });

    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(document.querySelector("[data-index]")).toBeNull();
  });

  it("applies a runtime max height to the virtual list", () => {
    renderListbox({ virtual: true, listMaxHeight: 240 });

    expect(screen.getByRole("listbox").style.maxHeight).toBe("240px");
  });

  it("keeps one list element while a virtual list's items arrive", () => {
    const { rerender } = renderListbox({ items: [], virtual: true });
    const list = screen.getByRole("listbox");

    rerender({ items: produce, virtual: true });

    expect(screen.getByRole("listbox")).toBe(list);
  });

  it("applies contentCss to the virtual list", () => {
    renderListbox({ virtual: true, contentCss: { maxHeight: "240px" } });

    expect(screen.getByRole("listbox").className.split(" ")).toContain("max-h_240px");
  });

  it("keeps navigation order matching render order when groupBy toggles off", async () => {
    const { rerender } = renderListbox({ groupBy: (item) => item.kind });
    rerender({ groupBy: undefined });

    const rendered = optionValues();
    await userEvent.tab();
    expect(highlightedValue()).toBe(rendered[0]);
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(rendered[1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(rendered[2]);
  });

  it("omits the heading for an empty group key", () => {
    renderListbox({ groupBy: (item) => (item.kind === "Fruit" ? "" : item.kind) });

    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(groupLabels()).toEqual([null, "Vegetable"]);
  });

  it("renders group headings through renderGroupLabel", () => {
    renderListbox({
      groupBy: (item) => item.kind,
      renderGroupLabel: (group, groupItems) => `${group} (${groupItems.length})`,
    });

    expect(groupLabels()).toEqual(["Fruit (2)", "Vegetable (1)"]);
  });

  it("shows only the empty state when a grouped collection has no items", () => {
    renderListbox({ items: [], groupBy: (item) => item.kind });

    expect(screen.queryAllByRole("group")).toHaveLength(0);
    expect(within(screen.getByRole("listbox")).getByText("No items available")).not.toBeNull();
  });

  it("announces the empty state outside the listbox", () => {
    renderListbox({ items: [] });

    const listbox = screen.getByRole("listbox");
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("No items available");
    expect(listbox.contains(status)).toBe(false);
    expect(within(listbox).getByText("No items available")).not.toBeNull();
  });

  it("keeps grouping props off the DOM", () => {
    renderListbox({
      groupBy: (item) => item.kind,
      groupSort: ["Vegetable", "Fruit"],
      renderGroupLabel: (group) => group,
    });

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
    renderListbox();
    expect(screen.getByRole("listbox").closest("[data-scope='scroll-area']")).not.toBeNull();
  });

  it("points the search input at the listbox it controls", () => {
    renderListbox({ search: true });

    expect(screen.getByRole("textbox").getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
  });

  it("keeps a custom root content id on the composed list", () => {
    const collection = createListCollection({ items: ["north", "south"] });
    render(
      <Listbox.Root
        collection={collection}
        ids={{ content: "custom" }}
      >
        <Listbox.Input />
        <Listbox.Content>
          {collection.items.map((item) => (
            <Listbox.Item
              key={item}
              item={item}
            >
              <Listbox.ItemText>{item}</Listbox.ItemText>
            </Listbox.Item>
          ))}
        </Listbox.Content>
      </Listbox.Root>,
    );

    expect(screen.getByRole("listbox").id).toBe("custom");
    expect(screen.getByRole("textbox").getAttribute("aria-controls")).toBe("custom");
  });

  it("rejects root props the managed selection owns", () => {
    const props: ListboxProps<Produce, number, "multiple"> = {
      items: produce,
      getItemValue: (item) => item.id,
      getItemLabel: (item) => item.name,
      selectionMode: "multiple",
      value: [],
      onValueChange: vi.fn(),
      // @ts-expect-error defaultValue belongs to the managed selection
      defaultValue: [encodeSelectionValue(1)],
    };
    expect(props).toBeDefined();
  });

  it("allows controlled multiple state", async () => {
    function Example() {
      const [value, setValue] = useState<number[]>([]);
      return (
        <Listbox
          {...produceProps}
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
