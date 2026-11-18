import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from ".";

describe("LoginPage", () => {
  it("flags empty fields on submit instead of disabling Sign in", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginPage onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  });

  it("flags a malformed email instead of submitting it", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginPage onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "jane");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  });
});
