import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Fieldset } from ".";
import { Radio, RadioGroup } from "../Radio";

it("describes an invalid fieldset by its error text", () => {
  render(
    <Fieldset.Root invalid>
      <Fieldset.Legend>Email</Fieldset.Legend>
      <Fieldset.ErrorText>Email is required.</Fieldset.ErrorText>
    </Fieldset.Root>,
  );

  expect(
    screen.getByRole("group", { name: "Email", description: "Email is required." }),
  ).not.toBeNull();
});

it("names its radio group and is described by parts given their own ids", () => {
  render(
    <Fieldset.Root>
      <Fieldset.Legend id="plan-legend">Plan</Fieldset.Legend>
      <Fieldset.HelperText id="plan-help">Billed monthly.</Fieldset.HelperText>
      <RadioGroup>
        <Radio value="basic">Basic</Radio>
      </RadioGroup>
    </Fieldset.Root>,
  );

  expect(screen.getByRole("radiogroup", { name: "Plan" })).not.toBeNull();
  expect(
    screen.getByRole("group", { name: "Plan", description: "Billed monthly." }),
  ).not.toBeNull();
});
