import { fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

const imeEnter = { key: "Enter", keyCode: 229 };

describe("Textarea", () => {
  it("calls onEnter on Enter but not on an IME-confirming Enter", () => {
    const onEnter = vi.fn();
    render(<Textarea onEnter={onEnter} />);
    const field = screen.getByRole("textbox");

    expect(fireEvent.keyDown(field, imeEnter)).toBe(true);
    expect(onEnter).not.toHaveBeenCalled();

    expect(fireEvent.keyDown(field, { key: "Enter" })).toBe(false);
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it("submits on Enter with preventNewline but not on an IME-confirming Enter", () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Textarea preventNewline />
        <button type="submit">Save</button>
      </form>,
    );
    const field = screen.getByRole("textbox");

    expect(fireEvent.keyDown(field, imeEnter)).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    expect(fireEvent.keyDown(field, { key: "Enter" })).toBe(false);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("stops resizing on value writes once autoresize turns off", () => {
    const field = (props: { autoresize?: boolean; value: string }) => (
      <Textarea
        {...props}
        onChange={() => {}}
      />
    );
    const { rerender } = render(field({ autoresize: true, value: "a" }));
    rerender(field({ value: "a" }));
    const frame = vi.spyOn(window, "requestAnimationFrame");

    rerender(field({ value: "a\nb" }));

    expect(frame).not.toHaveBeenCalled();
    frame.mockRestore();
  });

  it("leaves submitting to onEnter when preventNewline blocks Shift+Enter", () => {
    const onEnter = vi.fn();
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Textarea
          onEnter={onEnter}
          preventNewline
        />
        <button type="submit">Save</button>
      </form>,
    );

    expect(fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", shiftKey: true })).toBe(
      false,
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
  });
});
