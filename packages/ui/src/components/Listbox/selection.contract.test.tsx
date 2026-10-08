import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, type Mock, vi } from "vitest";

import { Listbox } from ".";
import { ApplySelect, Select, TagSelect } from "../Select";
import {
  encodedValues,
  groupLabels,
  highlightedValue,
  optionValues,
  type Produce,
  produceProps,
} from "./selection.fixtures";
import type { ManagedListOptions, ManagedSelectionProps } from "./types";
import { encodeSelectionValue } from "./useSelectionController";

interface ContractProps
  extends
    Pick<ManagedSelectionProps<Produce, number>, "search" | "groupBy">,
    Pick<ManagedListOptions<Produce, number>, "indicatorPosition" | "renderItemActions"> {
  value?: number[];
}

interface Handlers {
  onValueChange: Mock;
  onOpenChange: Mock;
}

interface SelectionWrapper {
  name: string;
  mode: "single" | "multiple";
  closesOnPick: boolean;
  mount: (props: ContractProps, handlers: Handlers) => void;
  commit?: () => Promise<void>;
}

const wrappers: SelectionWrapper[] = [
  {
    name: "Listbox",
    mode: "single",
    closesOnPick: false,
    mount: ({ value = [], ...props }, { onValueChange }) =>
      render(
        <Listbox
          {...produceProps}
          value={value[0] ?? null}
          onValueChange={onValueChange}
          {...props}
        />,
      ),
  },
  {
    name: "Listbox (multiple)",
    mode: "multiple",
    closesOnPick: false,
    mount: ({ value = [], ...props }, { onValueChange }) =>
      render(
        <Listbox
          {...produceProps}
          selectionMode="multiple"
          value={value}
          onValueChange={onValueChange}
          {...props}
        />,
      ),
  },
  {
    name: "Select",
    mode: "single",
    closesOnPick: true,
    mount: ({ value = [], ...props }, handlers) =>
      render(
        <Select
          {...produceProps}
          {...handlers}
          value={value[0] ?? null}
          defaultOpen
          {...props}
        />,
      ),
  },
  {
    name: "Select (multiple)",
    mode: "multiple",
    closesOnPick: false,
    mount: ({ value = [], ...props }, handlers) =>
      render(
        <Select
          {...produceProps}
          {...handlers}
          selectionMode="multiple"
          value={value}
          defaultOpen
          {...props}
        />,
      ),
  },
  {
    name: "TagSelect",
    mode: "multiple",
    closesOnPick: false,
    mount: ({ value = [], ...props }, handlers) =>
      render(
        <TagSelect
          {...produceProps}
          {...handlers}
          value={value}
          defaultOpen
          {...props}
        />,
      ),
  },
  {
    name: "ApplySelect",
    mode: "multiple",
    closesOnPick: false,
    mount: ({ value = [], ...props }, handlers) =>
      render(
        <ApplySelect
          {...produceProps}
          {...handlers}
          value={value}
          defaultOpen
          {...props}
        />,
      ),
    commit: () => userEvent.click(screen.getByRole("button", { name: "Apply" })),
  },
];

describe.each(wrappers)("$name selection contract", (wrapper) => {
  const renderWrapper = (props: ContractProps) => {
    const handlers = { onValueChange: vi.fn(), onOpenChange: vi.fn() };
    wrapper.mount(props, handlers);
    return handlers;
  };

  const picked = (values: number[]) => (wrapper.mode === "single" ? values.at(-1) : values);

  it("emits the complete selection when an option is clicked", async () => {
    const { onValueChange } = renderWrapper({ value: [1], search: false });

    await userEvent.click(screen.getByRole("option", { name: "Banana" }));
    await wrapper.commit?.();
    expect(onValueChange).toHaveBeenCalledWith(picked([1, 3]));
  });

  it("keeps item actions from changing the selection", async () => {
    const onAction = vi.fn();
    const { onValueChange } = renderWrapper({
      search: false,
      renderItemActions: (item) => (
        <button
          type="button"
          onClick={onAction}
        >
          Edit {item.name}
        </button>
      ),
    });

    await userEvent.click(screen.getByRole("button", { name: "Edit Apple" }));
    await wrapper.commit?.();
    expect(onAction).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("filters through the search option's placeholder and filter", async () => {
    renderWrapper({
      search: {
        placeholder: "Find produce",
        filter: (item, query) => item.name.toLowerCase().startsWith(query.toLowerCase()),
      },
    });

    await userEvent.type(screen.getByPlaceholderText("Find produce"), "a");
    expect(screen.getByText("Apple")).not.toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();
  });

  it("renders group headings and nests items under their group", () => {
    renderWrapper({ search: false, groupBy: (item) => item.kind });

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

  it("keeps grouping while searching and drops emptied groups", async () => {
    renderWrapper({ search: true, groupBy: (item) => item.kind });

    await userEvent.type(screen.getByPlaceholderText("Search..."), "Ban");
    expect(groupLabels()).toEqual(["Fruit"]);
    expect(optionValues()).toEqual(encodedValues(3));
    expect(screen.queryByText("Carrot")).toBeNull();
  });

  it("applies indicator placement through the recipe", () => {
    renderWrapper({ value: [1], search: false, indicatorPosition: "start" });

    expect(screen.getByRole("listbox").className).toContain(
      "listbox__content--indicatorPosition_start",
    );
  });

  describe("search input keyboard", () => {
    it("moves the highlight with the arrow keys while the input keeps focus", async () => {
      renderWrapper({ search: true });
      const input = screen.getByRole("textbox");

      await userEvent.click(input);
      await userEvent.keyboard("{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(1));
      await userEvent.keyboard("{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(2));
      await userEvent.keyboard("{ArrowUp}");
      expect(highlightedValue()).toBe(encodeSelectionValue(1));

      expect(document.activeElement).toBe(input);
      expect(input.getAttribute("aria-activedescendant")).toBe(
        document.querySelector("[role='option'][data-highlighted]")?.id,
      );
    });

    it("selects the highlighted option with Enter", async () => {
      const { onValueChange, onOpenChange } = renderWrapper({ search: true });

      await userEvent.click(screen.getByRole("textbox"));
      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      expect(onOpenChange.mock.calls).toEqual(wrapper.closesOnPick ? [[false]] : []);
      await wrapper.commit?.();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(picked([2]));
    });

    it("highlights the first match while typing", async () => {
      const { onValueChange, onOpenChange } = renderWrapper({ search: true });

      await userEvent.type(screen.getByRole("textbox"), "an");
      expect(highlightedValue()).toBe(encodeSelectionValue(3));
      await userEvent.keyboard("{Enter}");
      expect(onOpenChange.mock.calls).toEqual(wrapper.closesOnPick ? [[false]] : []);
      await wrapper.commit?.();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(picked([3]));
    });

    it("leaves Home to the input caret", async () => {
      renderWrapper({ search: true });

      await userEvent.click(screen.getByRole("textbox"));
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(2));
      await userEvent.keyboard("{Home}");
      expect(highlightedValue()).toBe(encodeSelectionValue(2));
    });

    it("navigates grouped options in group order", async () => {
      renderWrapper({ search: true, groupBy: (item) => item.kind });

      await userEvent.click(screen.getByRole("textbox"));
      await userEvent.keyboard("{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(1));
      await userEvent.keyboard("{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(3));
      await userEvent.keyboard("{ArrowDown}");
      expect(highlightedValue()).toBe(encodeSelectionValue(2));
    });
  });
});
