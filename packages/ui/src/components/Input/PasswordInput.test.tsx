import { render, screen } from "@testing-library/react";
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
});
