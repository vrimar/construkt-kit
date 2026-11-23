import { act, render, screen, waitFor } from "@testing-library/react";
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

  it("validates each pasted tag on its own", async () => {
    const user = userEvent.setup();
    const onValueInvalid = vi.fn();
    renderTagsInput({
      addOnPaste: true,
      validate: ({ inputValue }) => inputValue !== "bad",
      onValueInvalid,
    });

    await user.click(screen.getByRole("textbox", { name: "Tags" }));
    await user.paste("a,bad,c");

    await waitFor(() =>
      expect(
        screen.queryAllByRole("button", { name: /^Delete tag / }).map((button) => button.ariaLabel),
      ).toEqual(["Delete tag a", "Delete tag c"]),
    );
    expect(onValueInvalid).toHaveBeenCalledWith("invalidTag");
  });

  it("keeps typed text that validate refuses", async () => {
    const user = userEvent.setup();
    renderTagsInput({ validate: ({ inputValue }) => inputValue !== "bad" });
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Tags" });

    await user.type(input, "bad{Enter}");

    expect(input.value).toBe("bad");
  });

  it("neither deletes nor edits a disabled tag from the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TagsInput.Root
        defaultValue={["React", "Vue"]}
        onValueChange={onValueChange}
      >
        <TagsInput.Label>Tags</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Items disabled />
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Root>,
    );
    const input = screen.getByRole("textbox", { name: "Tags" });

    await user.click(input);
    await user.keyboard("{Backspace}{Backspace}{Delete}{Enter}");
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("edits the highlighted tag in its own input on Enter", async () => {
    const user = userEvent.setup();
    renderTagsInput({ defaultValue: ["React", "Vue"] });

    await user.click(screen.getByRole("textbox", { name: "Tags" }));
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Enter}");

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: /^Editing tag React/ }),
      ),
    );
  });

  it("stores an edit trimmed, and keeps one validate refuses in its input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onValueInvalid = vi.fn();
    renderTagsInput({
      defaultValue: ["React", "Vue"],
      onValueChange,
      onValueInvalid,
      validate: ({ inputValue }) => inputValue !== "bad",
    });

    await user.click(screen.getByRole("textbox", { name: "Tags" }));
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Enter}");
    const edit = screen.getByRole("textbox", { name: /^Editing tag React/ });
    await waitFor(() => expect(document.activeElement).toBe(edit));
    await user.clear(edit);
    await user.type(edit, "bad{Enter}");

    expect(onValueInvalid).toHaveBeenCalledWith("invalidTag");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(edit);

    await user.clear(edit);
    await user.type(edit, " Solid {Enter}");

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
      ["Solid", "Vue"],
      expect.objectContaining({ reason: "edit" }),
    );
  });

  it("keeps disabled tags, marked disabled, when clearing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TagsInput.Root
        defaultValue={["Locked", "React"]}
        onValueChange={onValueChange}
      >
        <TagsInput.Label>Tags</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Item
            index={0}
            value="Locked"
            disabled
          >
            <TagsInput.ItemPreview>
              <TagsInput.ItemText>Locked</TagsInput.ItemText>
            </TagsInput.ItemPreview>
          </TagsInput.Item>
          <TagsInput.Item
            index={1}
            value="React"
          >
            <TagsInput.ItemPreview>
              <TagsInput.ItemText>React</TagsInput.ItemText>
            </TagsInput.ItemPreview>
          </TagsInput.Item>
          <TagsInput.Input />
          <TagsInput.ClearTrigger />
        </TagsInput.Control>
      </TagsInput.Root>,
    );

    expect(screen.getByText("Locked").hasAttribute("data-disabled")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Clear all tags" }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
      ["Locked"],
      expect.objectContaining({ reason: "clear" }),
    );
    expect(screen.queryByRole("button", { name: "Clear all tags" })).toBeNull();
  });

  it("goes back to its initial tags when its form resets, with no hidden input", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Post">
        <TagsInput.Root defaultValue={["React"]}>
          <TagsInput.Label>Tags</TagsInput.Label>
          <TagsInput.Control>
            <TagsInput.Items />
            <TagsInput.Input />
          </TagsInput.Control>
        </TagsInput.Root>
      </form>,
    );

    await user.type(screen.getByRole("textbox", { name: "Tags" }), "Vue{Enter}");
    expect(screen.queryByRole("button", { name: "Delete tag Vue" })).not.toBeNull();
    act(() => screen.getByRole<HTMLFormElement>("form", { name: "Post" }).reset());

    expect(screen.queryByRole("button", { name: "Delete tag Vue" })).toBeNull();
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
