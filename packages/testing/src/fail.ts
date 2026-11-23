import type { Page, Route } from "@playwright/test";

import { type ApiOperation, operationTable } from "./operations";

export interface FailOptions {
  status?: number;
  /** The message the app shows: the body's `detail`, as `@construkt-kit/api` reads it. */
  detail?: string;
}

/**
 * Answers the next request for `operation` with an error in the shape `@construkt-kit/api` parses,
 * without letting it reach the API. Resolves once the route is in place.
 */
export async function failNext(
  page: Page,
  operation: Pick<ApiOperation, "method" | "path">,
  { status = 500, detail = "Injected failure" }: FailOptions = {},
): Promise<void> {
  const table = operationTable([{ ...operation, read: false }]);
  let spent = false;
  const isTarget = (url: URL) => table.find(operation.method, url.pathname) !== undefined;
  const handler = async (route: Route) => {
    if (spent || route.request().method() !== operation.method.toUpperCase()) {
      await route.fallback();
      return;
    }
    spent = true;
    await route.fulfill({
      status,
      contentType: "application/problem+json",
      body: JSON.stringify({ status, title: "Injected failure", detail }),
    });
    await page.unroute(isTarget, handler);
  };
  await page.route(isTarget, handler);
}
