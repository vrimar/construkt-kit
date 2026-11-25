import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { mountedSheet, sheetOf } from "../../_shared/sheet";
import { Field } from "../Form";
import { Listbox, type SingleSelectionProps } from "../Listbox";
import { encodeSelectionValue } from "../selection";
import { groupLabels, highlightedValue, produceProps } from "../selection/selection.fixtures";
import { Select, type SelectProps } from "./Select";

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

  it("opens the list from the trigger with ArrowDown", async () => {
    const onOpenChange = vi.fn();
    renderSelect({ onOpenChange });

    await userEvent.tab();
    const trigger = document.activeElement as HTMLElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await userEvent.keyboard("{ArrowDown}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "list-navigation" }),
    );
  });

  it("names the trigger and its list after its Field's label, invalid and described by its error", async () => {
    render(
      <Field
        label="Fruit"
        invalid
        errorText="Pick a fruit."
      >
        <Select
          {...optionProps}
          value={1}
          onValueChange={vi.fn()}
          triggerProps={{ id: "fruit" }}
        />
      </Field>,
    );

    const trigger = screen.getByRole("button", { name: "Fruit Alpha" });
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(trigger.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe("Pick a fruit.");

    await userEvent.click(trigger);
    expect(screen.getByRole("listbox", { name: "Fruit" })).not.toBeNull();
  });

  it("uses trigger width by default", () => {
    renderSelect({ open: true });
    expect(screen.getByRole("listbox").closest(".popover__content")?.className).toContain(
      "w_var(--anchor-width)",
    );
  });

  it("applies root style props to the listbox root and *Css props to their parts", () => {
    renderSelect({ w: "200px", contentCss: { minW: "320px" }, listCss: { p: "0" }, open: true });
    const list = screen.getByRole("listbox");
    const contentClasses = list.closest(".popover__content")?.className.split(" ") ?? [];
    expect(list.className.split(" ")).toContain("p_0");
    expect(contentClasses).toContain("min-w_320px");
    expect(contentClasses).not.toContain("min-w_140px");
    expect(document.querySelector(".listbox__root")?.className.split(" ")).toContain("w_200px");
  });

  it("applies an explicit content width", () => {
    renderSelect({ contentWidth: 320, open: true });
    const content = screen.getByRole("listbox").closest<HTMLElement>(".popover__content");
    expect(content?.style.width).toBe("320px");
    expect(content?.className).not.toMatch(/(^|\s)w_/);
  });

  it("resolves a size token as the content width", () => {
    renderSelect({ contentWidth: "sm", open: true });
    const content = screen.getByRole("listbox").closest<HTMLElement>(".popover__content");
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
    const clientHeight = vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(200);
    onTestFinished(() => {
      offsetHeight.mockRestore();
      clientHeight.mockRestore();
    });
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
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "item-press" }),
    );
  });

  it("closes once when a different item is picked", async () => {
    const onOpenChange = vi.fn();
    renderSelect({ value: 2, open: true, onOpenChange });

    await userEvent.click(screen.getByRole("option", { name: "Alpha" }));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "item-press" }),
    );
  });

  it("notifies open changes in uncontrolled mode", async () => {
    const onOpenChange = vi.fn();
    renderSelect({ onOpenChange });
    await userEvent.click(screen.getByRole("button", { name: "Select item" }));
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
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

  it("reports the query reset on close only when the query changed", async () => {
    const onQueryChange = vi.fn();
    renderSelect({ search: { mode: "external", onQueryChange } });
    const trigger = screen.getByRole("button", { name: "Select item" });

    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(onQueryChange).not.toHaveBeenCalled();

    await userEvent.click(trigger);
    await userEvent.type(screen.getByPlaceholderText("Search..."), "be");
    onQueryChange.mockClear();
    await userEvent.click(trigger);
    expect(onQueryChange).toHaveBeenCalledExactlyOnceWith("");
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
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(
      false,
      expect.objectContaining({ reason: "item-press" }),
    );
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
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(
      false,
      expect.objectContaining({ reason: "item-press" }),
    );
  });

  it("stays open when an IME-confirming Enter lands on the selected option", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    renderSelect({ value: 2, onValueChange, onOpenChange, search: true, open: true });

    const search = screen.getByRole("textbox");
    await userEvent.type(search, "bet");
    fireEvent.keyDown(search, { key: "Enter", keyCode: 229 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(search, { key: "Enter" });
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(
      false,
      expect.objectContaining({ reason: "item-press" }),
    );
  });

  it("drops the highlight when reopened", async () => {
    renderSelect({ search: true, defaultOpen: true });

    await userEvent.click(screen.getByRole("textbox"));
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

  describe("highlight scrolling", () => {
    const ROW = 60;
    const placeOptionsInRows = () =>
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
        this: Element,
      ) {
        const content = this.closest(".listbox__content");
        if (this === content) return DOMRect.fromRect({ height: 100 });
        const index = Number(this.getAttribute("data-value")?.replace(/\D/g, "") || 1) - 1;
        return DOMRect.fromRect({ y: index * ROW - (content?.scrollTop ?? 0), height: ROW });
      });

    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(400);
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("scrolls the keyboard-highlighted option into view after opening", async () => {
      placeOptionsInRows();
      renderSelect({ search: true });

      await nextFrame();
      await userEvent.click(screen.getByRole("button", { name: "Select item" }));
      await nextFrame();
      await userEvent.click(screen.getByRole("textbox"));
      await userEvent.keyboard("{ArrowUp}");
      expect(screen.getByRole("listbox").scrollTop).toBe(2 * ROW + ROW - 100);
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
      placeOptionsInRows();
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
      expect(screen.getByRole("listbox").scrollTop).toBe(0);
    });
  });

  describe("on phones", () => {
    const renderOnPhone = (props?: SelectOverrides) => {
      const media = mockMatchMedia(viewportWidth(375));
      renderSelect(props);
      return { media, trigger: screen.getByRole("button") };
    };

    it("opens in a bottom sheet below md and anchored at md and up", async () => {
      const { media, trigger } = renderOnPhone();

      await userEvent.click(trigger);
      expect(sheetOf(screen.getByRole("listbox"))).not.toBeNull();

      await userEvent.keyboard("{Escape}");
      // A press while the sheet still animates out reopens that same sheet.
      await waitFor(() => expect(mountedSheet()).toBeNull());
      act(() => media.setMatches(viewportWidth(1024)));

      await userEvent.click(trigger);
      expect(sheetOf(screen.getByRole("listbox"))).toBeNull();
    });

    it("stays anchored on a phone when asked to", async () => {
      const { trigger } = renderOnPhone({ mobileLayout: "popover" });

      await userEvent.click(trigger);

      expect(sheetOf(screen.getByRole("listbox"))).toBeNull();
    });

    it("stays a sheet when the viewport crosses md while open", async () => {
      const { media, trigger } = renderOnPhone();

      await userEvent.click(trigger);
      act(() => media.setMatches(viewportWidth(1024)));

      expect(sheetOf(screen.getByRole("listbox"))).not.toBeNull();
    });
  });
});
