import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
  { id: 3, label: "Gamma" },
];

afterEach(cleanup);

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
    expect(screen.getByRole("listbox").closest("[data-part='content']")?.className).toContain(
      "w_320",
    );
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
    expect(screen.queryByRole("searchbox")).toBeNull();
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
    expect((screen.getByPlaceholderText("Search...") as HTMLInputElement).value).toBe("");
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
