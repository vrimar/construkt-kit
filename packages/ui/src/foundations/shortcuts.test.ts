import { describe, expect, it } from "vitest";

import { matchesShortcut } from "./shortcuts";

describe("matchesShortcut", () => {
  it("matches a key written as a space character", () => {
    const event = new KeyboardEvent("keydown", { key: " ", code: "Space", ctrlKey: true });

    expect(matchesShortcut(event, "Ctrl+ ", { mac: false })).toBe(true);
  });
});
