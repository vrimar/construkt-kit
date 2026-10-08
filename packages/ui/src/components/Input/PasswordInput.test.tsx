import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("styles the group so the visibility toggle stays inside the field", () => {
    render(
      <PasswordInput
        w="200px"
        placeholder="Password"
      />,
    );

    const input = screen.getByPlaceholderText("Password");
    expect(input.parentElement?.className.split(" ")).toContain("w_200px");
    expect(input.className.split(" ")).not.toContain("w_200px");
  });

  it("puts className and style on the group", () => {
    render(
      <PasswordInput
        className="password-field"
        style={{ maxWidth: "20rem" }}
        placeholder="Password"
      />,
    );

    const input = screen.getByPlaceholderText("Password");
    expect(input.parentElement?.className.split(" ")).toContain("password-field");
    expect(input.parentElement?.style.maxWidth).toBe("20rem");
    expect(input.className.split(" ")).not.toContain("password-field");
    expect(input.style.maxWidth).toBe("");
  });

  it("keeps the toggle in charge of the type when one is passed", async () => {
    const user = userEvent.setup();
    const untypedProps: object = { type: "text" };
    render(
      <PasswordInput
        placeholder="Password"
        {...untypedProps}
      />,
    );

    const input = screen.getByPlaceholderText("Password");
    expect(input.getAttribute("type")).toBe("password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.getAttribute("type")).toBe("text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.getAttribute("type")).toBe("password");
  });
});
