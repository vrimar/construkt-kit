import type { NumberFilterValue } from "@construkt-kit/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { NumberFilter, type NumberFilterProps } from ".";

const renderFilter = (overrides: Partial<NumberFilterProps> = {}) => {
  const onValueChange = vi.fn();
  const Harness = () => {
    const [value, setValue] = useState<NumberFilterValue | undefined>(overrides.value);
    return (
      <NumberFilter
        placeholder="Amount"
        {...overrides}
        value={value}
        onValueChange={(next) => {
          onValueChange(next);
          setValue(next);
        }}
      />
    );
  };
  render(<Harness />);
  return { onValueChange };
};

const pickOperator = async (triggerLabel: string, itemText: string) => {
  await userEvent.click(screen.getByRole("button", { name: triggerLabel }));
  await userEvent.click(await screen.findByText(itemText, { exact: false }));
};

describe("NumberFilter", () => {
  it("renders the default operator on the trigger", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: "Equals" }).textContent).toBe("=");
  });

  it("emits an eq filter for a typed value", async () => {
    const { onValueChange } = renderFilter();

    await userEvent.type(screen.getByPlaceholderText("Amount"), "100");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith({ operator: "eq", value: 100 }),
    );
  });

  it("re-emits immediately when the operator changes", async () => {
    const { onValueChange } = renderFilter({ value: { operator: "eq", value: 100 } });

    await pickOperator("Equals", "Greater or equal");
    expect(onValueChange).toHaveBeenLastCalledWith({ operator: "gte", value: 100 });
  });

  it("emits a between filter only once both bounds are valid", async () => {
    const { onValueChange } = renderFilter({ defaultOperator: "between" });

    await userEvent.type(screen.getByPlaceholderText("From"), "10");
    await userEvent.type(screen.getByPlaceholderText("To"), "20");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith({ operator: "between", value: 10, to: 20 }),
    );
    expect(onValueChange.mock.calls.every(([v]) => v === undefined || v.to !== undefined)).toBe(
      true,
    );
  });

  it("emits undefined immediately when the value is cleared", async () => {
    const { onValueChange } = renderFilter({ value: { operator: "lt", value: 5 } });

    await userEvent.clear(screen.getByPlaceholderText("Amount"));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("emits nothing for text that is not a number while no filter is active", async () => {
    const { onValueChange } = renderFilter();

    await userEvent.type(screen.getByPlaceholderText("Amount"), "-");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears the active filter when the operand stops parsing", async () => {
    const { onValueChange } = renderFilter({ value: { operator: "eq", value: 100 } });

    await userEvent.type(screen.getByPlaceholderText("Amount"), "e");
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(undefined));
  });

  it("keeps the active filter while a newly picked between is incomplete", async () => {
    const { onValueChange } = renderFilter({ value: { operator: "gte", value: 100 } });

    await pickOperator("Greater or equal", "Between");
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText("To"), "200");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith({ operator: "between", value: 100, to: 200 }),
    );
  });

  it("resyncs when the parent restores a value it previously emitted", async () => {
    const onValueChange = vi.fn();
    const Harness = ({ forced }: { forced: NumberFilterValue | undefined }) => {
      const [value, setValue] = useState<NumberFilterValue | undefined>(undefined);
      const [synced, setSynced] = useState(forced);
      if (synced !== forced) {
        setSynced(forced);
        setValue(forced);
      }
      return (
        <NumberFilter
          placeholder="Amount"
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    };
    const { rerender } = render(<Harness forced={undefined} />);

    await userEvent.type(screen.getByPlaceholderText("Amount"), "7");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith({ operator: "eq", value: 7 }),
    );

    rerender(<Harness forced={undefined} />);
    await userEvent.clear(screen.getByPlaceholderText("Amount"));

    rerender(<Harness forced={{ operator: "eq", value: 7 }} />);
    expect(screen.getByPlaceholderText("Amount")).toHaveProperty("value", "7");
  });

  it("clears both operands and the filter from the clear button", async () => {
    const { onValueChange } = renderFilter({ value: { operator: "between", value: 10, to: 20 } });

    await userEvent.click(screen.getByRole("button", { name: "Clear filter" }));

    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByPlaceholderText("From")).toHaveProperty("value", "");
    expect(screen.getByPlaceholderText("To")).toHaveProperty("value", "");
  });

  it("shows no clear button while both operands are empty", () => {
    renderFilter();

    expect(screen.queryByRole("button", { name: "Clear filter" })).toBeNull();
  });

  it("only offers the configured operators", async () => {
    renderFilter({ operators: ["gt", "lt"] });

    await userEvent.click(screen.getByRole("button", { name: "Greater than" }));
    expect(await screen.findByText("Less than", { exact: false })).toBeTruthy();
    expect(screen.queryByText("Between", { exact: false })).toBeNull();
  });
});
