import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from ".";
import { Input } from "../Input";

describe("Field", () => {
  it("points its label at a control that brings its own id", () => {
    render(
      <Field label="Email">
        <Input id="email" />
      </Field>,
    );

    expect(screen.getByRole("textbox", { name: "Email" }).id).toBe("email");
  });

  it("describes its control by its helper text", () => {
    render(
      <Field
        label="Email"
        helperText="We'll never share it."
      >
        <Input />
      </Field>,
    );

    expect(
      screen.getByRole("textbox", { name: "Email", description: "We'll never share it." }),
    ).not.toBeNull();
  });
});
