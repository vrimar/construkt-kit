import { afterEach, describe, expect, it, vi } from "vitest";

import { buildQueryString, fileNameFromContentDisposition, saveBlob } from "./query";

describe("buildQueryString", () => {
  it("serializes dates as ISO 8601 in UTC", () => {
    const from = new Date("2024-01-15T12:00:00.123+02:00");

    expect(buildQueryString({ from, range: { to: from } })).toBe(
      "from=2024-01-15T10%3A00%3A00.123Z&range%5Bto%5D=2024-01-15T10%3A00%3A00.123Z",
    );
  });

  it("skips invalid dates like empty values", () => {
    expect(buildQueryString({ from: new Date("nope"), page: 2 })).toBe("page=2");
  });

  it("indexes array elements contiguously past empty ones", () => {
    expect(buildQueryString({ status: ["", "open"] })).toBe("status%5B0%5D=open");
    expect(
      buildQueryString({ ids: [null, undefined, new Date("nope"), 5, {}, [], 7, { id: "" }] }),
    ).toBe("ids%5B0%5D=5&ids%5B1%5D=7");
  });

  it("indexes nested array elements contiguously past empty ones", () => {
    expect(buildQueryString({ filters: { status: ["", "open", "closed"] }, page: 1 })).toBe(
      "filters%5Bstatus%5D%5B0%5D=open&filters%5Bstatus%5D%5B1%5D=closed&page=1",
    );
    expect(buildQueryString({ rows: [{ id: null }, { id: 3 }] })).toBe("rows%5B0%5D%5Bid%5D=3");
  });

  it("emits nothing for an array of only empty elements", () => {
    expect(buildQueryString({ status: ["", null, undefined], page: 2 })).toBe("page=2");
    expect(buildQueryString({ status: [] })).toBe("");
  });
});

describe("saveBlob", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("revokes the blob URL only after a delay", () => {
    vi.useFakeTimers();
    const anchor = { href: "", download: "", click: vi.fn() };
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("document", {
      createElement: () => anchor,
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    });
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL");

    saveBlob(new Blob(["a,b"]), 'attachment; filename="report.csv"');

    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.download).toBe("report.csv");
    expect(revokeObjectURL).not.toHaveBeenCalled();

    vi.advanceTimersByTime(39_999);
    expect(revokeObjectURL).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(anchor.href);
  });
});

describe("fileNameFromContentDisposition", () => {
  it("decodes an RFC 8187 filename with attr-chars beyond letters and digits", () => {
    expect(
      fileNameFromContentDisposition(
        "attachment; filename=\"R_D.xlsx\"; filename*=UTF-8''R&D+Q1!~%E2%82%AC.xlsx",
      ),
    ).toBe("R&D+Q1!~€.xlsx");
  });

  it("falls back to the plain filename when the RFC 8187 one is malformed", () => {
    expect(
      fileNameFromContentDisposition(
        "attachment; filename=\"report.xlsx\"; filename*=UTF-8''report%E2%82.xlsx",
      ),
    ).toBe("report.xlsx");
  });

  it("falls back to the plain filename", () => {
    expect(fileNameFromContentDisposition('attachment; filename="report.xlsx"')).toBe(
      "report.xlsx",
    );
  });
});
