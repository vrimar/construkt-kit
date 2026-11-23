import { createMatchMedia } from "@construkt-kit/config/vitest";
import { breakpointDownQuery, breakpoints } from "@construkt-kit/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { ResetPasswordPage } from ".";

describe("ResetPasswordPage", () => {
  it("keeps each password field labelled and outside any button", () => {
    render(<ResetPasswordPage onSubmit={vi.fn()} />);

    expect(document.body.querySelector("button input, button button")).toBeNull();
    expect(screen.getByLabelText("New password").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Confirm password").tagName).toBe("INPUT");
  });

  it("flags and focuses the first invalid field on submit instead of disabling Reset password", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordPage onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New password"), "Abcdefg1!");
    await user.type(screen.getByLabelText("Confirm password"), "Abcdefg1?");
    await user.click(screen.getByRole("button", { name: "Reset password" }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const confirm = screen.getByLabelText("Confirm password");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(confirm);
    expect(confirm.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getAllByText("Passwords do not match.")).toHaveLength(1);
  });

  it("closes the password rules without pulling focus back", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("New password"), "abc");
    expect(await screen.findByText("Password Rules")).not.toBeNull();

    const confirm = screen.getByLabelText("Confirm password");
    await user.click(confirm);
    await waitFor(() => expect(screen.queryByText("Password Rules")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(confirm);
  });

  it("keeps the password field focused while the rules show on a phone", async () => {
    const phone = createMatchMedia((query) =>
      breakpoints.some((bp) => query === breakpointDownQuery(bp)),
    );
    vi.stubGlobal("matchMedia", phone.matchMedia);
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const user = userEvent.setup();
    render(<ResetPasswordPage onSubmit={vi.fn()} />);

    const password = screen.getByLabelText("New password");
    await user.type(password, "abc");
    expect(await screen.findByText("Password Rules")).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(password);
    expect((password as HTMLInputElement).value).toBe("abc");
  });
});
