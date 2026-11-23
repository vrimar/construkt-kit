import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Radio, RadioGroup } from ".";

it("submits the value of a group given a name, and nothing for one without", () => {
  render(
    <form aria-label="Order">
      <RadioGroup
        name="size"
        defaultValue="m"
      >
        <Radio value="m">Medium</Radio>
      </RadioGroup>
      <RadioGroup defaultValue="asc">
        <Radio value="asc">Ascending</Radio>
      </RadioGroup>
    </form>,
  );

  const data = new FormData(screen.getByRole<HTMLFormElement>("form", { name: "Order" }));

  expect([...data]).toEqual([["size", "m"]]);
});
