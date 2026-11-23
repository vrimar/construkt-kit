import { render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { expect, it, vi } from "vitest";

import { TagsInput } from ".";

it("blocks submitting a required empty input and focuses where tags are typed", () => {
  const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
  render(
    <form
      aria-label="Post"
      onSubmit={onSubmit}
    >
      <TagsInput.Root
        required
        name="tags"
      >
        <TagsInput.Label>Tags</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Input />
        </TagsInput.Control>
        <TagsInput.HiddenInput />
      </TagsInput.Root>
    </form>,
  );

  screen.getByRole<HTMLFormElement>("form", { name: "Post" }).requestSubmit();

  expect(onSubmit).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Tags" }));
});
