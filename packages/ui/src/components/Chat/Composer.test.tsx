import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Composer } from "./Composer";

describe("Chat.Composer", () => {
  it("doesn't send while busy and stops through the stop button", () => {
    const onSend = vi.fn();
    const onStop = vi.fn();
    render(
      <Composer
        defaultValue="Next question"
        busy
        onSend={onSend}
        onStop={onStop}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledOnce();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("keeps focus when the send button turns into the stop button", () => {
    const { rerender } = render(
      <Composer
        value="Next question"
        onSend={() => {}}
        onStop={() => {}}
      />,
    );
    screen.getByRole("button", { name: "Send" }).focus();

    rerender(
      <Composer
        value="Next question"
        onSend={() => {}}
        onStop={() => {}}
        busy
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Stop" }));
  });

  it("stops listening on Enter instead of sending", () => {
    const onSend = vi.fn();
    const onListeningChange = vi.fn();
    render(
      <Composer
        defaultValue="Spoken so far"
        listening
        onListeningChange={onListeningChange}
        onSend={onSend}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onListeningChange).toHaveBeenCalledWith(false);
    expect(onSend).not.toHaveBeenCalled();
  });
});
