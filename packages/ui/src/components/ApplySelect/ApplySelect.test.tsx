import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApplySelect } from ".";

const frameworks = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
  { id: 3, name: "Angular" },
];

afterEach(cleanup);

describe("ApplySelect", () => {
  it("stages values and emits the complete draft on Apply", async () => {
    const onValueChange = vi.fn();
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
      />,
    );

    await userEvent.click(screen.getByRole("option", { name: "React" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1]);
  });

  it("discards staged changes on Cancel", async () => {
    const onValueChange = vi.fn();
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[1]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
      />,
    );
    await userEvent.click(screen.getByText("Vue"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("can apply a cleared selection", async () => {
    const onValueChange = vi.fn();
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[1]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
      />,
    );
    await userEvent.click(screen.getByRole("option", { name: "React" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("selects and clears the complete collection through Toggle All", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
        actions={{ toggleAll: true }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Select All" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([1, 2, 3]);

    rerender(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[1, 2, 3]}
        onValueChange={onValueChange}
        defaultOpen
        search={false}
        actions={{ toggleAll: true }}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear All" })).not.toBeNull();
  });

  it("keeps the applied value on the trigger while editing the draft", async () => {
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[1]}
        onValueChange={vi.fn()}
        defaultOpen
        search={false}
      />,
    );
    await userEvent.click(screen.getByText("Vue"));
    expect(screen.getByRole("button", { name: "React" })).not.toBeNull();
  });

  it("filters through the shared typed search configuration", async () => {
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[]}
        onValueChange={vi.fn()}
        defaultOpen
        search={{
          placeholder: "Find framework",
          filter: (item, query) => item.name.toLowerCase().startsWith(query.toLowerCase()),
        }}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("Find framework"), "v");
    expect(screen.getByText("Vue")).not.toBeNull();
    expect(screen.queryByText("React")).toBeNull();
  });

  it("notifies controlled open consumers when Apply closes", async () => {
    const onOpenChange = vi.fn();
    render(
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={[]}
        onValueChange={vi.fn()}
        open
        onOpenChange={onOpenChange}
        search={false}
      />,
    );
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
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
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
          items={frameworks}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.name}
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
