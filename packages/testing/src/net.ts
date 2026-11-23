import type { Page, Request } from "@playwright/test";

import { type ApiOperation, operationTable } from "./operations";

export interface RecordedRequest {
  method: string;
  /** The URL path, such as `/api/variables/12`. */
  path: string;
  url: string;
  /** The JSON body, or the raw text when it isn't JSON; undefined without one. */
  body: unknown;
  /** The operation it matched; undefined for a request under `apiPrefix` the table lacks. */
  operation?: ApiOperation;
  read: boolean;
}

/** One expected write: every given field must match, and `body` matches as a subset. */
export interface WriteMatcher {
  operationId?: string;
  method?: string;
  /** An exact path, the operation's template, or a pattern for the path. */
  path?: string | RegExp;
  body?: unknown;
}

export interface SettleOptions {
  /** How long the API must stay quiet with nothing in flight. */
  quietMs?: number;
  timeoutMs?: number;
}

export interface RequestRecorder {
  all(): RecordedRequest[];
  writes(): RecordedRequest[];
  clear(): void;
  /** Waits until no API request is in flight and none has started for `quietMs`. */
  settle(options?: SettleOptions): Promise<void>;
  /** Settles, then checks the writes since the last `clear` are exactly these, in order. */
  expectWrites(expected: readonly WriteMatcher[], options?: SettleOptions): Promise<void>;
  /** Settles, then checks nothing was written since the last `clear`. */
  expectNoWrites(options?: SettleOptions): Promise<void>;
}

export interface RecordOptions {
  operations: readonly ApiOperation[];
  /** A request whose path starts here but matches no operation is still recorded, read by its method. */
  apiPrefix?: string;
}

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const bodyOf = (request: Request): unknown => {
  const text = request.postData();
  if (text == null) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/** `actual` holds every field of `expected`; arrays match element by element, at the same length. */
export function matchesSubset(actual: unknown, expected: unknown): boolean {
  if (expected === null || typeof expected !== "object") return Object.is(actual, expected);
  if (Array.isArray(expected))
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((item, i) => matchesSubset(actual[i], item))
    );
  if (actual === null || typeof actual !== "object") return false;
  return Object.entries(expected).every(([key, value]) =>
    matchesSubset((actual as Record<string, unknown>)[key], value),
  );
}

const matches = (request: RecordedRequest, matcher: WriteMatcher): boolean =>
  (matcher.operationId === undefined || request.operation?.operationId === matcher.operationId) &&
  (matcher.method === undefined || request.method === matcher.method.toUpperCase()) &&
  (matcher.path === undefined ||
    (typeof matcher.path === "string"
      ? request.path === matcher.path || request.operation?.path === matcher.path
      : matcher.path.test(request.path))) &&
  (matcher.body === undefined || matchesSubset(request.body, matcher.body));

const describe = (request: RecordedRequest) =>
  `${request.method} ${request.path}${request.body === undefined ? "" : ` ${JSON.stringify(request.body)}`}`;

/**
 * Records the page's API requests from now on, telling reads from writes by the app's operation
 * table, so a test can assert exactly what a flow wrote.
 */
export function recordRequests(
  page: Page,
  { operations, apiPrefix }: RecordOptions,
): RequestRecorder {
  const table = operationTable(operations);
  let recorded: RecordedRequest[] = [];
  const inFlight = new Set<Request>();
  let lastStart = Date.now();

  const done = (request: Request) => inFlight.delete(request);
  page.on("request", (request) => {
    const url = new URL(request.url());
    const method = request.method();
    const operation = table.find(method, url.pathname);
    if (!operation && !(apiPrefix && url.pathname.startsWith(apiPrefix))) return;
    inFlight.add(request);
    lastStart = Date.now();
    recorded.push({
      method,
      path: url.pathname,
      url: request.url(),
      body: bodyOf(request),
      operation,
      read: operation ? operation.read : READ_METHODS.has(method),
    });
  });
  page.on("requestfinished", done);
  page.on("requestfailed", done);

  const settle = async ({ quietMs = 300, timeoutMs = 10_000 }: SettleOptions = {}) => {
    const deadline = Date.now() + timeoutMs;
    while (inFlight.size > 0 || Date.now() - lastStart < quietMs) {
      if (Date.now() > deadline) {
        const pending = [...inFlight].map((r) => `${r.method()} ${r.url()}`).join(", ");
        throw new Error(
          `The API didn't settle within ${timeoutMs}ms; in flight: ${pending || "none"}.`,
        );
      }
      await page.waitForTimeout(50);
    }
  };

  const writes = () => recorded.filter((request) => !request.read);

  return {
    all: () => [...recorded],
    writes,
    clear: () => {
      recorded = [];
    },
    settle,
    async expectWrites(expected, options) {
      await settle(options);
      const actual = writes();
      const ok =
        actual.length === expected.length && expected.every((m, i) => matches(actual[i], m));
      if (!ok)
        throw new Error(
          `Expected ${expected.length} write(s): ${JSON.stringify(expected)}\nGot ${actual.length}:\n${actual.map(describe).join("\n") || "(none)"}`,
        );
    },
    async expectNoWrites(options) {
      await settle(options);
      const actual = writes();
      if (actual.length)
        throw new Error(`Expected no writes, got:\n${actual.map(describe).join("\n")}`);
    },
  };
}
