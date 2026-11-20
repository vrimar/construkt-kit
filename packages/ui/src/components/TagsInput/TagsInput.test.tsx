import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TagsInput, type TagsInputRootProps } from ".";
import { Field } from "../Form";

function renderTagsInput(props: TagsInputRootProps = {}) {
  return render(
    <form aria-label="Post">
      <TagsInput.Root
        name="tags"
        {...props}
      >
        <TagsInput.Label>Tags</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Items />
          <TagsInput.Input />
        </TagsInput.Control>
        <TagsInput.HiddenInput />
      </TagsInput.Root>
    </form>,
  );
}

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

    expect(container.querySelectorAll('[data-slot="item"]')).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("keeps the tags and the typed text when the change is canceled", async () => {
    const user = userEvent.setup();
    renderTagsInput({
      defaultValue: ["React"],
      onValueChange: (_value, details) => details.cancel(),
    });

    await user.type(screen.getByRole("textbox", { name: "Tags" }), "Vue{Enter}");

    expect(screen.queryByRole("button", { name: "Delete tag Vue" })).toBeNull();
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Tags" }).value).toBe("Vue");
  });

  it("submits the tags it holds under its name", async () => {
    const user = userEvent.setup();
    renderTagsInput({ defaultValue: ["React"] });

    await user.type(screen.getByRole("textbox", { name: "Tags" }), "Vue{Enter}");
    await Promise.resolve();

    const form = screen.getByRole<HTMLFormElement>("form", { name: "Post" });
    expect(new FormData(form).get("tags")).toBe("React, Vue");
  });

  it("focuses its input on mount with autoFocus", async () => {
    renderTagsInput({ autoFocus: true });

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Tags" })),
    );
  });

  it("adds pasted tags up to max and skips empty ones", async () => {
    const user = userEvent.setup();
    renderTagsInput({ defaultValue: ["x"], addOnPaste: true, max: 3 });
    const tags = () =>
      screen
        .queryAllByRole("button", { name: /^Delete tag / })
        .map((button) => button.getAttribute("aria-label"));

    await user.click(screen.getByRole("textbox", { name: "Tags" }));
    await user.paste("a,,b,c");

    await waitFor(() => expect(tags()).toEqual(["Delete tag x", "Delete tag a", "Delete tag b"]));
  });

  it("is labelled by an enclosing Field", () => {
    render(
      <Field label="Keywords">
        <TagsInput.Root>
          <TagsInput.Control>
            <TagsInput.Input />
          </TagsInput.Control>
        </TagsInput.Root>
      </Field>,
    );

    expect(screen.getByRole("textbox", { name: "Keywords" })).not.toBeNull();
  });
});
