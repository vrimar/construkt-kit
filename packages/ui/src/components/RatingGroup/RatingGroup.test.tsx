import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { RatingGroup } from ".";

it("marks the rated star checked and every other one unchecked, the first one included while unrated", async () => {
  render(
    <RatingGroup.Root>
      <RatingGroup.Control />
    </RatingGroup.Root>,
  );
  const marks = () =>
    screen
      .getAllByRole("radio")
      .map((star) => [star.hasAttribute("data-checked"), star.hasAttribute("data-unchecked")]);
  const unchecked = [false, true];

  expect(marks()).toEqual([unchecked, unchecked, unchecked, unchecked, unchecked]);

  await userEvent.click(screen.getByRole("radio", { name: "3 stars" }));

  expect(marks()).toEqual([unchecked, unchecked, [true, false], unchecked, unchecked]);
});

it("goes back to its initial rating when the form its input joins through `form` resets", async () => {
  render(
    <>
      <form id="review" />
      <RatingGroup.Root
        form="review"
        name="rating"
        defaultValue={2}
      >
        <RatingGroup.Control />
        <RatingGroup.HiddenInput />
      </RatingGroup.Root>
    </>,
  );
  const form = document.getElementById("review") as HTMLFormElement;
  await userEvent.click(screen.getByRole("radio", { name: "4 stars" }));
  expect(new FormData(form).get("rating")).toBe("4");

  act(() => form.reset());

  expect(new FormData(form).get("rating")).toBe("2");
  expect(screen.getByRole("radio", { name: "2 stars" }).getAttribute("aria-checked")).toBe("true");
});
