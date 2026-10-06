import type { UseListboxContext } from "@ark-ui/react/listbox";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Listbox } from "../Listbox";
import { encodeSelectionValue } from "../Listbox/managed";
import { encodedValues, groupLabels, optionValues, produce } from "../Listbox/selection.fixtures";
import { Select } from "./Select";

type ListboxApi = UseListboxContext<unknown>;

const highlightedValue = () =>
  document.querySelector("[role='option'][data-highlighted]")?.getAttribute("data-value");

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const options = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
  { id: 3, label: "Gamma" },
];

describe("Select", () => {
  it("infers generic items and emits native numeric values", async () => {
    const onValueChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={onValueChange}
        open
        renderItem={(item) => <span>Option: {item.label}</span>}
      />,
    );

    await userEvent.click(screen.getByText("Option: Beta"));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("supports conventional compound composition with Root render callbacks", () => {
    render(
      <Select.Root
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        open
        renderItem={(item, state) => (
          <span>
            {item.label}:{String(state.selected)}
          </span>
        )}
      >
        <Select.Trigger buttonProps={{ label: "Choose" }} />
        <Select.Content data-testid="content">
          <Select.List />
        </Select.Content>
      </Select.Root>,
    );

    expect(screen.getByText("Alpha:false")).not.toBeNull();
    expect(screen.getByTestId("content")).not.toBeNull();
  });

  it("uses trigger width by default", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        open
      />,
    );
    expect(screen.getByRole("listbox").closest("[data-part='content']")?.className).toContain(
      "w_full",
    );
  });

  it("applies root style props to the listbox root and *Css props to their parts", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        w="200px"
        contentCss={{ minW: "320px" }}
        listCss={{ p: "0" }}
        open
      />,
    );
    const list = screen.getByRole("listbox");
    const contentClasses = list.closest("[data-part='content']")?.className.split(" ") ?? [];
    expect(list.className.split(" ")).toContain("p_0");
    expect(contentClasses).toContain("min-w_320px");
    expect(contentClasses).not.toContain("min-w_140px");
    expect(
      document.querySelector("[data-scope='listbox'][data-part='root']")?.className.split(" "),
    ).toContain("w_200px");
  });

  it("applies an explicit content width", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        contentWidth={320}
        open
      />,
    );
    const content = screen.getByRole("listbox").closest<HTMLElement>("[data-part='content']");
    expect(content?.style.width).toBe("320px");
    expect(content?.className).not.toMatch(/(^|\s)w_/);
  });

  it("resolves a size token as the content width", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        contentWidth="sm"
        open
      />,
    );
    const content = screen.getByRole("listbox").closest<HTMLElement>("[data-part='content']");
    expect(content?.style.width).toBe("var(--sizes-sm)");
  });

  it("filters through the unified search option", async () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        search={{
          placeholder: "Search options",
          filter: (item, query) => item.label.toLowerCase().startsWith(query.toLowerCase()),
        }}
        open
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Search options"), "g");
    expect(screen.getByText("Gamma")).not.toBeNull();
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("does not render search when omitted", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        open
      />,
    );
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("renders the configured empty state", () => {
    render(
      <Select
        items={[] as typeof options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        emptyMessage="Nothing found"
        open
      />,
    );
    expect(screen.getByText("Nothing found")).not.toBeNull();
  });

  it("emits complete arrays in multiple mode", async () => {
    const onValueChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        selectionMode="multiple"
        value={[1]}
        onValueChange={onValueChange}
        open
      />,
    );
    await userEvent.click(screen.getByText("Beta"));
    expect(onValueChange).toHaveBeenCalledWith([1, 2]);
  });

  it("closes when the selected item is picked again", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={2}
        onValueChange={onValueChange}
        open
        onOpenChange={onOpenChange}
      />,
    );

    await userEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes once when a different item is picked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={2}
        onValueChange={vi.fn()}
        open
        onOpenChange={onOpenChange}
      />,
    );

    await userEvent.click(screen.getByRole("option", { name: "Alpha" }));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("notifies open changes in uncontrolled mode", async () => {
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("resets an uncontrolled search query after close", async () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        search
        defaultOpen
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Search..."), "beta");
    expect(screen.queryByText("Alpha")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    expect(screen.getByText("Alpha")).not.toBeNull();
    expect(screen.getByPlaceholderText<HTMLInputElement>("Search...").value).toBe("");
  });

  it("keeps item actions interactive without selecting the row", async () => {
    const onValueChange = vi.fn();
    const onAction = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={onValueChange}
        renderItemActions={(item) => (
          <button
            type="button"
            onClick={onAction}
          >
            Edit {item.label}
          </button>
        )}
        open
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Edit Alpha" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("stays open after an item action unless the action closes it", async () => {
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        onOpenChange={onOpenChange}
        renderItemActions={(item, _, { close }) => (
          <>
            <button type="button">Pin {item.label}</button>
            <button
              type="button"
              onClick={close}
            >
              Edit {item.label}
            </button>
          </>
        )}
        open
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Pin Alpha" }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Edit Alpha" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("forwards trigger props when custom children are used", () => {
    render(
      <Select.Root
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
      >
        <Select.Trigger aria-label="Custom trigger">
          <button type="button">Open</button>
        </Select.Trigger>
        <Select.Content>
          <Select.List />
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.getByRole("button", { name: "Custom trigger" })).not.toBeNull();
  });

  it("renders a custom controlled value label", () => {
    function Example() {
      const [value, setValue] = useState<number | null>(1);
      return (
        <Select
          items={options}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.label}
          value={value}
          onValueChange={setValue}
          renderValue={({ selectedItems }) => `Chosen: ${selectedItems[0]?.label}`}
        />
      );
    }
    render(<Example />);
    expect(screen.getByRole("button", { name: "Chosen: Alpha" })).not.toBeNull();
  });

  it("renders grouped items in the popover list", () => {
    render(
      <Select
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        open
      />,
    );

    expect(groupLabels()).toEqual(["Fruit", "Vegetable"]);
    expect(optionValues()).toEqual(encodedValues(1, 3, 2));
  });

  it("threads renderGroupLabel through the compound context", () => {
    render(
      <Select.Root
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        renderGroupLabel={(group, groupItems) => `${group} (${groupItems.length})`}
        value={null}
        onValueChange={vi.fn()}
        open
      >
        <Select.Trigger />
        <Select.Content>
          <Select.List />
        </Select.Content>
      </Select.Root>,
    );

    expect(groupLabels()).toEqual(["Fruit (2)", "Vegetable (1)"]);
  });

  it("keeps grouping while searching", async () => {
    render(
      <Select
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        value={null}
        onValueChange={vi.fn()}
        search
        defaultOpen
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Search..."), "Car");
    expect(groupLabels()).toEqual(["Vegetable"]);
    expect(optionValues()).toEqual(encodedValues(2));
  });

  it("exposes the listbox group parts", () => {
    expect(Select.ItemGroup).toBe(Listbox.ItemGroup);
    expect(Select.ItemGroupLabel).toBe(Listbox.ItemGroupLabel);
  });

  it("selects and closes from the search input with the keyboard", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        search={{ autoFocus: true }}
        defaultOpen
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("closes once when Enter re-picks the selected option from the search input", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={2}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        search
        open
      />,
    );

    await userEvent.type(screen.getByRole("textbox"), "bet");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("drops the highlight when reopened", async () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        search={{ autoFocus: true }}
        defaultOpen
      />,
    );

    await nextFrame();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(highlightedValue()).toBe(encodeSelectionValue(2));
    await userEvent.keyboard("{Escape}");
    await nextFrame();
    expect(screen.queryByRole("listbox")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    await nextFrame();
    expect(screen.getByRole("listbox").getAttribute("aria-activedescendant")).toBeNull();
    expect(screen.getByRole("textbox").getAttribute("aria-activedescendant")).toBeNull();

    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{ArrowDown}");
    expect(highlightedValue()).toBe(encodeSelectionValue(1));
  });

  it.each([
    ["clearValue", (api: ListboxApi) => api.clearValue()],
    ["setValue([])", (api: ListboxApi) => api.setValue([])],
  ])("ignores an imperative %s in single mode", async (_, clear) => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Select.Root
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={2}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        open
      >
        <Select.Trigger />
        <Select.Content>
          <Select.List />
          <Listbox.Context>
            {(api) => (
              <button
                type="button"
                onClick={() => clear(api)}
              >
                Clear
              </button>
            )}
          </Listbox.Context>
        </Select.Content>
      </Select.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("option", { name: "Beta" }).getAttribute("aria-selected")).toBe("true");
  });

  describe("highlight scrolling", () => {
    const scrollIntoView = vi.fn();

    beforeEach(() => {
      Element.prototype.scrollIntoView = scrollIntoView;
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(400);
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    });

    afterEach(() => {
      Reflect.deleteProperty(Element.prototype, "scrollIntoView");
      scrollIntoView.mockReset();
      vi.restoreAllMocks();
    });

    it("scrolls the keyboard-highlighted option into view after opening", async () => {
      render(
        <Select
          items={options}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.label}
          value={null}
          onValueChange={vi.fn()}
          search
        />,
      );

      await nextFrame();
      await userEvent.click(screen.getByRole("button", { name: "Select item" }));
      await nextFrame();
      await userEvent.click(screen.getByRole("textbox"));
      await userEvent.keyboard("{ArrowUp}");
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(
        screen.getByRole("option", { name: "Gamma" }),
      );
    });

    it("scrolls a virtual list to the keyboard-highlighted index", async () => {
      const many = Array.from({ length: 100 }, (_, index) => ({
        id: index,
        label: `Item ${index}`,
      }));
      const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
      render(
        <Select
          items={many}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.label}
          value={null}
          onValueChange={vi.fn()}
          search
          virtual
        />,
      );

      await nextFrame();
      await userEvent.click(screen.getByRole("button", { name: "Select item" }));
      await nextFrame();
      await userEvent.click(screen.getByRole("textbox"));
      scrollTo.mockClear();
      await userEvent.keyboard("{ArrowUp}");
      expect(scrollTo).toHaveBeenCalled();
    });

    it("does not scroll when an option is pressed", async () => {
      render(
        <Select
          items={options}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.label}
          selectionMode="multiple"
          value={[]}
          onValueChange={vi.fn()}
        />,
      );

      await nextFrame();
      await userEvent.click(screen.getByRole("button", { name: "Select item" }));
      await nextFrame();
      await userEvent.click(screen.getByRole("option", { name: "Beta" }));
      expect(screen.getByRole("listbox").getAttribute("aria-activedescendant")).not.toBeNull();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  it("applies logical indicator placement", () => {
    render(
      <Select
        items={options}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={1}
        onValueChange={vi.fn()}
        indicatorPosition="start"
        open
      />,
    );
    expect(screen.getByRole("listbox").className).toContain(
      "listbox__content--indicatorPosition_start",
    );
  });
});
