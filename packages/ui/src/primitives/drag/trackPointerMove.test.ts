import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackPointerMove } from "./trackPointerMove";

const handlers = { onMove: () => {}, onUp: () => {} };
const userSelect = () => document.documentElement.style.webkitUserSelect;

describe("trackPointerMove on iOS", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(navigator, "platform", "get").mockReturnValue("iPhone");
    document.documentElement.style.webkitUserSelect = "text";
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.style.webkitUserSelect = "";
  });

  it("gives text selection back after a second drag that starts while the first is releasing", () => {
    trackPointerMove(document, handlers)();
    vi.advanceTimersByTime(100);
    trackPointerMove(document, handlers)();
    vi.advanceTimersByTime(300);

    expect(userSelect()).toBe("text");
  });

  it("keeps text selection blocked until every overlapping drag is released", () => {
    const releaseFirst = trackPointerMove(document, handlers);
    const releaseSecond = trackPointerMove(document, handlers);

    releaseFirst();
    vi.advanceTimersByTime(300);
    expect(userSelect()).toBe("none");

    releaseSecond();
    vi.advanceTimersByTime(300);
    expect(userSelect()).toBe("text");
  });
});
