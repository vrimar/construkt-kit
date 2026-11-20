import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { LocaleProvider } from "./LocaleProvider";
import { Stat } from "./Stat";

it("formats a Stat value in the provided locale", () => {
  render(
    <LocaleProvider locale="de-DE">
      <Stat.Root>
        <Stat.ValueText value={1234.5} />
      </Stat.Root>
    </LocaleProvider>,
  );

  expect(screen.getByText("1.234,5")).toBeTruthy();
});
