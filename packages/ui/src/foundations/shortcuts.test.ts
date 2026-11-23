import { describe, expect, it } from "vitest";

import { matchesShortcut, shortcutFromEvent } from "./shortcuts";

describe("matchesShortcut", () => {
  it("matches a key written as a space character", () => {
    const event = new KeyboardEvent("keydown", { key: " ", code: "Space", ctrlKey: true });

    expect(matchesShortcut(event, "Ctrl+ ", { mac: false })).toBe(true);
  });
});

describe("Option on a Mac", () => {
  it("records and matches ⌥J by its physical key, not the ∆ it types", () => {
    const event = new KeyboardEvent("keydown", { key: "∆", code: "KeyJ", altKey: true });

    expect(shortcutFromEvent(event, true)).toBe("Alt+J");
    expect(matchesShortcut(event, "Alt+J", { mac: true })).toBe(true);
  });
});
