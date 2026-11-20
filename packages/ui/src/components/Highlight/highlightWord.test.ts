import { describe, expect, it } from "vitest";

import { highlightWord } from "./highlightWord";

describe("highlightWord", () => {
  it("highlights the match itself when lowercasing the text changes its length", () => {
    expect(highlightWord({ text: "İstanbul", query: "BUL", ignoreCase: true })).toEqual([
      { text: "İstan", match: false },
      { text: "bul", match: true },
    ]);
  });
});
