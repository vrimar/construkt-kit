import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagsInput } from ".";

describe("TagsInput", () => {
  it("renders duplicate tags without key collisions", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <TagsInput.Root
        allowDuplicates
        defaultValue={["a", "a"]}
      >
        <TagsInput.Control>
          <TagsInput.Items />
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>,
    );

    expect(container.querySelectorAll('[data-part="item"]')).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
