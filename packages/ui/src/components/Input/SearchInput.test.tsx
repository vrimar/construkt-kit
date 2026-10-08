import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("styles the group so the icon and clear button stay with a sized field", () => {
    render(
      <SearchInput
        width="200px"
        flex="1"
        className="search-field"
        placeholder="Search"
        value="query"
        onChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("Search");
    const groupClasses = input.parentElement?.className.split(" ") ?? [];
    const inputClasses = input.className.split(" ");
    expect(groupClasses).toEqual(expect.arrayContaining(["w_200px", "flex_1", "search-field"]));
    expect(inputClasses).not.toContain("w_200px");
    expect(inputClasses).not.toContain("flex_1");
    expect(inputClasses).not.toContain("search-field");
    expect(
      input.parentElement?.contains(screen.getByRole("button", { name: "Clear search" })),
    ).toBe(true);
  });

  it("offers clear for a zero value without rendering it as text", () => {
    render(
      <SearchInput
        placeholder="Search"
        value={0}
        onChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const group = screen.getByPlaceholderText("Search").parentElement;
    expect(screen.getByRole("button", { name: "Clear search" })).toBeDefined();
    expect(group?.textContent).toBe("");
  });

  it("hides clear for an empty value", () => {
    render(
      <SearchInput
        placeholder="Search"
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});
