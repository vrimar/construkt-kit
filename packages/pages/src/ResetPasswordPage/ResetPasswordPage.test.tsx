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
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("width <"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
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
