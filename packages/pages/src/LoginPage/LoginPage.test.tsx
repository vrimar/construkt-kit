import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from ".";

describe("LoginPage", () => {
  it("flags empty fields on submit instead of disabling Login", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginPage onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  });
});
