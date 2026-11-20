import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Clipboard, type ClipboardRootProps } from ".";

const renderClipboard = (indicator: ReactNode, props?: Partial<ClipboardRootProps>) =>
  render(
    <Clipboard.Root
      value="ada@example.com"
      {...props}
    >
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
    expect(await navigator.clipboard.readText()).toBe("ada@example.com");
  });

  it("keeps the value off the clipboard when onStatusChange cancels the copy", async () => {
    const user = userEvent.setup();
    renderClipboard(<Clipboard.Indicator copied="Copied!">Copy email</Clipboard.Indicator>, {
      value: "grace@example.com",
      onStatusChange: (_copied, details) => details.cancel(),
    });

    await user.click(screen.getByRole("button"));

    expect(await navigator.clipboard.readText()).not.toBe("grace@example.com");
    expect(screen.getByRole("button").textContent).toBe("Copy email");
  });

  it("falls back to a selection copy when writeText rejects, and reports a copy that fails", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Not allowed"));
    let allowed = false;
    const selected: string[] = [];
    document.execCommand = vi.fn(() => {
      selected.push(String(document.getSelection()));
      return allowed;
    });
    const statuses: [boolean, string][] = [];
    try {
      renderClipboard(<Clipboard.Indicator copied="Copied!">Copy email</Clipboard.Indicator>, {
        onStatusChange: (copied, details) => statuses.push([copied, details.reason]),
      });
      const trigger = screen.getByRole("button");

      await user.click(trigger);
      await vi.waitFor(() => expect(statuses).toHaveLength(2));
      expect(statuses).toEqual([
        [true, "trigger-press"],
        [false, "copy-error"],
      ]);
      expect(selected).toEqual(["ada@example.com"]);
      expect(trigger.textContent).toBe("Copy email");

      allowed = true;
      await user.click(trigger);

      expect(await screen.findByText("Copied!")).toBe(trigger.firstElementChild);
      expect(selected).toEqual(["ada@example.com", "ada@example.com"]);
      expect(statuses.at(-1)).toEqual([true, "trigger-press"]);
    } finally {
      writeText.mockRestore();
      Reflect.deleteProperty(document, "execCommand");
    }
  });
});
