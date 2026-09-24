import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("styles its child when rendered asChild", () => {
    render(
      <Button asChild>
        <a href="/download">Download</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Download" });
    expect(link.tagName).toBe("A");
    expect(link.className).toMatch(/\bbutton\b/);
    expect(link.hasAttribute("type")).toBe(false);
  });

  it("renders its icons around the asChild child's content", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Button
        asChild
        leftIcon={<span data-testid="left" />}
        rightIcon={<span data-testid="right" />}
      >
        <a href="/download">Download</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Download" });
    expect(link.firstElementChild).toBe(screen.getByTestId("left"));
    expect(link.lastElementChild).toBe(screen.getByTestId("right"));
    expect(link.textContent).toBe("Download");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("ignores loading when rendered asChild", () => {
    render(
      <Button
        asChild
        loading
      >
        <a href="/download">Download</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Download" });
    expect(link.hasAttribute("disabled")).toBe(false);
    expect(link.hasAttribute("data-loading")).toBe(false);
  });

  it("defaults to type button and keeps an explicit type", () => {
    render(
      <>
        <Button>Cancel</Button>
        <Button type="submit">Save</Button>
      </>,
    );

    expect(screen.getByRole("button", { name: "Cancel" }).getAttribute("type")).toBe("button");
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("type")).toBe("submit");
  });

  it("renders its icons around the label", () => {
    render(
      <Button
        leftIcon={<span data-testid="left" />}
        rightIcon={<span data-testid="right" />}
      >
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.firstElementChild).toBe(screen.getByTestId("left"));
    expect(button.lastElementChild).toBe(screen.getByTestId("right"));
  });
});
