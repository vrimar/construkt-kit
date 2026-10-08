import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Clipboard } from ".";

const renderClipboard = (indicator: ReactNode) =>
  render(
    <Clipboard.Root value="ada@example.com">
      <Clipboard.Trigger>{indicator}</Clipboard.Trigger>
    </Clipboard.Root>,
  );

describe("Clipboard", () => {
  it("renders the consumer's indicator children and copied content", async () => {
    const user = userEvent.setup();
    renderClipboard(<Clipboard.Indicator copied="Copied!">Copy email</Clipboard.Indicator>);

    const trigger = screen.getByRole("button");
    expect(trigger.textContent).toBe("Copy email");
    expect(trigger.querySelector("svg")).toBeNull();

    await user.click(trigger);

    expect(await screen.findByText("Copied!")).toBe(trigger.firstElementChild);
  });

  it("falls back to the copy icon without children", () => {
    renderClipboard(<Clipboard.Indicator />);

    expect(screen.getByRole("button").querySelector("svg.lucide-copy")).not.toBeNull();
  });

  it("renders CopyText's default label unless children are passed", () => {
    const { unmount } = renderClipboard(<Clipboard.CopyText />);
    expect(screen.getByRole("button").textContent).toBe("Copy");
    unmount();

    renderClipboard(<Clipboard.CopyText>Copy link</Clipboard.CopyText>);
    expect(screen.getByRole("button").textContent).toBe("Copy link");
  });
});
