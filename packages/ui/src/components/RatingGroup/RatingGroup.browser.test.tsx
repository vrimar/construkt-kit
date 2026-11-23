import { render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { expect, it, vi } from "vitest";

import { RatingGroup } from ".";

it("blocks submitting a required unrated group and focuses its first star", () => {
  const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
  render(
    <form
      aria-label="Review"
      onSubmit={onSubmit}
    >
      <RatingGroup.Root required>
        <RatingGroup.Control />
        <RatingGroup.HiddenInput />
      </RatingGroup.Root>
    </form>,
  );

  screen.getByRole<HTMLFormElement>("form", { name: "Review" }).requestSubmit();

  expect(onSubmit).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "1 stars" }));
});
