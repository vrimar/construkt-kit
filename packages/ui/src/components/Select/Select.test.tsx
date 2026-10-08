import type { UseListboxContext } from "@ark-ui/react/listbox";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

import { Listbox, type SingleSelectionProps } from "../Listbox";
import { encodeSelectionValue } from "../Listbox/managed";
import { groupLabels, highlightedValue, produceProps } from "../Listbox/selection.fixtures";
import { Select, type SelectProps } from "./Select";

type ListboxApi = UseListboxContext<unknown>;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const options = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
  { id: 3, label: "Gamma" },
];

type Option = (typeof options)[number];

const optionProps = {
  items: options,
  getItemValue: (item: Option) => item.id,
  getItemLabel: (item: Option) => item.label,
};

type SelectOverrides = Partial<SelectProps<Option, number> & SingleSelectionProps<number>>;

const renderSelect = (props?: SelectOverrides) =>
  render(
    <Select
      {...optionProps}
      value={null}
      onValueChange={vi.fn()}
      {...props}
    />,
  );

describe("Select", () => {
  it("supports conventional compound composition with Root render callbacks", () => {
    render(
      <Select.Root
        {...optionProps}
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
    renderSelect({ open: true });
    expect(screen.getByRole("listbox").closest("[data-part='content']")?.className).toContain(
      "w_full",
    );
  });

  it("applies root style props to the listbox root and *Css props to their parts", () => {
    renderSelect({ w: "200px", contentCss: { minW: "320px" }, listCss: { p: "0" }, open: true });
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
    renderSelect({ contentWidth: 320, open: true });
    const content = screen.getByRole("listbox").closest<HTMLElement>("[data-part='content']");
    expect(content?.style.width).toBe("320px");
    expect(content?.className).not.toMatch(/(^|\s)w_/);
  });

  it("resolves a size token as the content width", () => {
    renderSelect({ contentWidth: "sm", open: true });
    const content = screen.getByRole("listbox").closest<HTMLElement>("[data-part='content']");
    expect(content?.style.width).toBe("var(--sizes-sm)");
  });

  it("clears the query from the search field's clear button", async () => {
    render(
      <Select.Root
        {...optionProps}
        value={null}
        onValueChange={vi.fn()}
        search
        open
      >
        <Select.Trigger />
        <Select.Content>
          {/* @ts-expect-error the field owns onClear */}
          <Select.Search onClear={vi.fn()} />
          <Select.List />
        </Select.Content>
      </Select.Root>,
    );

    const input = screen.getByRole<HTMLInputElement>("textbox");
    await userEvent.type(input, "bet");
    expect(screen.queryByText("Alpha")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input.value).toBe("");
    expect(screen.getByText("Alpha")).not.toBeNull();
  });

  it("keeps a virtual list rendering when Select.List takes a ref", () => {
    const many = Array.from({ length: 100 }, (_, index) => ({ id: index, label: `Item ${index}` }));
    const listRef = createRef<HTMLDivElement>();
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(200);
    onTestFinished(() => offsetHeight.mockRestore());
    render(
      <Select.Root
        items={many}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.label}
        value={null}
        onValueChange={vi.fn()}
        virtual
        open
      >
        <Select.Trigger />
        <Select.Content>
          <Select.List ref={listRef} />
        </Select.Content>
      </Select.Root>,
    );

    expect(listRef.current).toBe(screen.getByRole("listbox"));
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
  });

  it("does not render search when omitted", () => {
    renderSelect({ open: true });
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("renders the configured empty state", () => {
    renderSelect({ items: [], emptyMessage: "Nothing found", open: true });
    expect(within(screen.getByRole("listbox")).getByText("Nothing found")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Nothing found");
  });

  it("closes when the selected item is picked again", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    renderSelect({ value: 2, onValueChange, open: true, onOpenChange });

    await userEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes once when a different item is picked", async () => {
    const onOpenChange = vi.fn();
    renderSelect({ value: 2, open: true, onOpenChange });

    await userEvent.click(screen.getByRole("option", { name: "Alpha" }));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("notifies open changes in uncontrolled mode", async () => {
    const onOpenChange = vi.fn();
    renderSelect({ onOpenChange });
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("resets an uncontrolled search query after close", async () => {
    renderSelect({ search: true, defaultOpen: true });

    await userEvent.type(screen.getByPlaceholderText("Search..."), "beta");
    expect(screen.queryByText("Alpha")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    expect(screen.getByText("Alpha")).not.toBeNull();
    expect(screen.getByPlaceholderText<HTMLInputElement>("Search...").value).toBe("");
  });

  it("stays open after an item action unless the action closes it", async () => {
    const onOpenChange = vi.fn();
    renderSelect({
      onOpenChange,
      renderItemActions: (item, _, { close }) => (
        <>
          <button type="button">Pin {item.label}</button>
          <button
            type="button"
            onClick={close}
          >
            Edit {item.label}
          </button>
        </>
      ),
      open: true,
    });

    await userEvent.click(screen.getByRole("button", { name: "Pin Alpha" }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Edit Alpha" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("forwards trigger props when custom children are used", () => {
    render(
      <Select.Root
        {...optionProps}
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
          {...optionProps}
          value={value}
          onValueChange={setValue}
          renderValue={({ selectedItems }) => `Chosen: ${selectedItems[0]?.label}`}
        />
      );
    }
    render(<Example />);
    expect(screen.getByRole("button", { name: "Chosen: Alpha" })).not.toBeNull();
  });

  it("threads renderGroupLabel through the compound context", () => {
    render(
      <Select.Root
        {...produceProps}
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

  it("exposes the listbox group parts", () => {
    expect(Select.ItemGroup).toBe(Listbox.ItemGroup);
    expect(Select.ItemGroupLabel).toBe(Listbox.ItemGroupLabel);
  });

  it("closes once when Enter re-picks the selected option from the search input", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    renderSelect({ value: 2, onValueChange, onOpenChange, search: true, open: true });

    await userEvent.type(screen.getByRole("textbox"), "bet");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("drops the highlight when reopened", async () => {
    renderSelect({ search: { autoFocus: true }, defaultOpen: true });

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
        {...optionProps}
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
      renderSelect({ search: true });

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
      renderSelect({ items: many, search: true, virtual: true });

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
          {...optionProps}
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
});
