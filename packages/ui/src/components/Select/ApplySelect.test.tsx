import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ApplySelect, type ApplySelectProps } from ".";

const frameworks = [
  { id: 1, name: "React", kind: "Library" },
  { id: 2, name: "Vue", kind: "Framework" },
  { id: 3, name: "Angular", kind: "Framework" },
];

type Framework = (typeof frameworks)[number];

const frameworkProps = {
  items: frameworks,
  getItemValue: (item: Framework) => item.id,
  getItemLabel: (item: Framework) => item.name,
};

const renderApplySelect = (props?: Partial<ApplySelectProps<Framework, number>>) =>
  render(
    <ApplySelect
      {...frameworkProps}
      value={[]}
      onValueChange={vi.fn()}
      defaultOpen
      search={false}
      {...props}
    />,
  );

describe("ApplySelect", () => {
  it("stages values and emits the complete draft on Apply", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({ onValueChange });

    await userEvent.click(screen.getByRole("option", { name: "React" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1]);
  });

  it("discards staged changes on Cancel", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({ value: [1], onValueChange });
    await userEvent.click(screen.getByText("Vue"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("applies an empty selection through Reset", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({ value: [1, 2], onValueChange, actions: { reset: true } });
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("can apply a cleared selection", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({ value: [1], onValueChange });
    await userEvent.click(screen.getByRole("option", { name: "React" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("selects and clears the complete collection through Toggle All", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({ onValueChange, actions: { toggleAll: true } });
    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1, 2, 3]);

    // Apply closes the popover, and `defaultOpen` only applies on mount — remount to
    // reopen rather than racing the close.
    cleanup();
    renderApplySelect({ value: [1, 2, 3], onValueChange, actions: { toggleAll: true } });
    expect(screen.getByRole("button", { name: "Deselect all" })).not.toBeNull();
  });

  it("toggles only the enabled items the search shows", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({
      isItemDisabled: (item) => item.name === "Angular",
      value: [2],
      onValueChange,
      search: true,
      actions: { toggleAll: true },
    });

    await userEvent.type(screen.getByPlaceholderText("Search..."), "r");
    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByRole("button", { name: "Deselect all" })).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([2, 1]);
  });

  it("deselects only the enabled items the search shows", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({
      isItemDisabled: (item) => item.name === "Angular",
      value: [1, 2, 3],
      onValueChange,
      search: true,
      actions: { toggleAll: true },
    });

    await userEvent.type(screen.getByPlaceholderText("Search..."), "r");
    await userEvent.click(screen.getByRole("button", { name: "Deselect all" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([2, 3]);
  });

  it("groups items without disturbing Toggle All", async () => {
    const onValueChange = vi.fn();
    renderApplySelect({
      groupBy: (item) => item.kind,
      onValueChange,
      actions: { toggleAll: true },
    });

    expect(screen.getAllByRole("group")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("keeps the applied value on the trigger while editing the draft", async () => {
    renderApplySelect({ value: [1] });
    await userEvent.click(screen.getByText("Vue"));
    expect(screen.getByRole("button", { name: "React" })).not.toBeNull();
  });

  it("keeps the placeholder on the trigger while only the draft has a selection", async () => {
    renderApplySelect();
    await userEvent.click(screen.getByRole("option", { name: "React" }));
    expect(screen.getByRole("button", { name: "Select item" })).not.toBeNull();
  });

  it("renders a custom trigger label from the applied value", async () => {
    renderApplySelect({
      value: [1],
      renderValue: ({ value, selectedItems }) =>
        `${String(value)}: ${selectedItems.map((item) => item.name).join(", ")}`,
    });
    await userEvent.click(screen.getByRole("option", { name: "Vue" }));
    expect(screen.getByRole("button", { name: "1: React" })).not.toBeNull();
  });

  it("lets contentWidth narrow the content below its default minimum", () => {
    renderApplySelect({ contentWidth: 200, search: true });
    const content = screen.getByRole("listbox").closest<HTMLElement>("[data-part='content']");
    expect(content?.style.width).toBe("200px");
    expect(content?.className).not.toMatch(/(^|\s)min-w_/);
  });

  it("notifies controlled open consumers when Apply closes", async () => {
    const onOpenChange = vi.fn();
    renderApplySelect({ open: true, onOpenChange });
    await userEvent.click(screen.getByText("React"));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports generic primitive items and falsey IDs", async () => {
    const onValueChange = vi.fn();
    render(
      <ApplySelect
        items={[0, 1]}
        getItemValue={(item) => item}
        getItemLabel={(item) => String(item)}
        value={[]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
      />,
    );
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([0]);
  });

  it("supports the compound API without an Items slot", async () => {
    const onValueChange = vi.fn();
    render(
      <ApplySelect.Root
        {...frameworkProps}
        value={[]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
        renderItem={(item) => <strong>{item.name}</strong>}
      >
        <ApplySelect.Trigger />
        <ApplySelect.Content>
          <ApplySelect.List />
          <ApplySelect.Actions />
        </ApplySelect.Content>
      </ApplySelect.Root>,
    );
    await userEvent.click(screen.getByText("React"));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1]);
  });

  it("updates a controlled value after Apply", async () => {
    function Example() {
      const [value, setValue] = useState<number[]>([]);
      return (
        <ApplySelect
          {...frameworkProps}
          value={value}
          onValueChange={setValue}
          defaultOpen
          search={false}
        />
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText("React"));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("button", { name: "React" })).not.toBeNull();
  });
});
