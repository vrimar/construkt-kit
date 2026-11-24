# @construkt-kit/testing

Playwright helpers for end-to-end tests of apps built on Construkt Kit. Component helpers live beside their
components (`@construkt-kit/ui/testing`, `@construkt-kit/data-grid/testing`, `@construkt-kit/pages/testing`); this
package holds what isn't one component's: gestures, API request recording, failure injection, overlay waits, platform
emulation, sign-in, per-worker servers and requirement coverage. `@playwright/test` is a peer.

Pair it with `@construkt-kit/config/playwright`'s `createPlaywrightConfig`, whose projects set the `platform` option
this package's `test` emulates.

## `test` and requirements

```ts
import { requirement, test } from "@construkt-kit/testing";

test("Next question takes `.`", { annotation: requirement("01#11") }, async ({ page }) => {
  // …
});
```

`test` is Playwright's, extended with the `platform` option (`"mac"`, `"ios"`, `"windows"`): set per project, it
makes every page report that platform through `navigator.platform`, `maxTouchPoints` and `userAgentData`, which a
device preset alone leaves at the host's. `primaryModifier(platform)` is the key that plays Ctrl's part there.

`requirement(id)` is the annotation the coverage reporter reads.

## Gestures

| Export                                        | Does                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `startDrag(page, source, { kind })`           | Presses on `source` and starts a drag; returns `moveTo`, `drop`, `cancel` |
| `dragTo(page, source, target, { kind })`      | The whole drag in one call                                                |
| `touchDrag(page, target, dx, dy, { holdMs })` | One real touch, Chromium only (DevTools protocol)                         |

`kind` is `"native"` for HTML drag and drop (the kit's `useDraggable`, pragmatic-drag-and-drop) and `"pointer"` for
drags built on pointer events (`usePointerDrag`, grid grips). Chromium and WebKit fire a native drag's `dragover` one
mouse move late, so every native move ends with a 1px nudge that delivers it. `moveTo(target, { until })` waits for
what the page shows when the target takes the drag. `cancel()` presses Escape for a pointer drag; a native drag can't
be cancelled from the keyboard in every engine, so `cancel(away)` lets go over a place that takes nothing.

## API requests

```ts
import { failNext, recordRequests } from "@construkt-kit/testing";

import { operations } from "@/api/gen/operations";

const net = recordRequests(page, { operations, apiPrefix: "/api/" });
await page.getByRole("button", { name: "Save" }).click();
await net.expectWrites([
  { method: "PUT", path: "/api/profile/shortcuts", body: { nextQuestion: "." } },
]);

await failNext(
  page,
  { method: "PUT", path: "/api/profile/shortcuts" },
  { detail: "Couldn't save" },
);
```

`operations` is the table `construkt-kit-api-gen` writes beside the generated client. A request is a read when its
operation reads (GET, HEAD, OPTIONS, or `x-read-only` in the spec). `expectWrites` and `expectNoWrites` first wait
until no API request is in flight and none has started for 300 ms, then compare the writes since the last `clear()`:
exactly those, in order, each matching every field given and its `body` as a subset. `failNext` answers the next
matching request with an error in the shape `@construkt-kit/api` parses, without it reaching the API.

## Overlays

`overlaysSettled(page)` waits until no kit overlay is opening or closing (`data-starting-style`,
`data-ending-style`), then two frames, so focus has returned.
`pressEscape(page, times)` presses Escape and settles after each press, so each closes one layer.

## Sign-in and servers

- `credentialsFromEnv("E2E")` reads `E2E_USER` and `E2E_PASSWORD`, and names whichever is missing.
- `signedInState(browser, { baseURL, file, signIn })` signs in once in a throwaway context and saves its storage
  state to `file`, for `use: { storageState }`.
- `startServer({ command, args, env, url })` starts a server for one worker, such as `vite preview` on the worker's
  own port, resolves once `url` answers, and returns `stop()`. Playwright's `webServer` starts one per run.

## Coverage reporter

```ts
createPlaywrightConfig({
  reporters: [["@construkt-kit/testing/reporter", { cells, requireEveryCell: !!process.env.CI }]],
});
```

`cells` lists every requirement on every project it must hold on: `{ id, project, expect: "pass" | "fixme" }`. The
reporter fails the run when a test names no requirement, a cell that ran didn't pass (or a `fixme` cell isn't a
`test.fixme` with a reason), a test runs on a project its requirement doesn't list, or, with `requireEveryCell`, a
cell has no test. Leave `requireEveryCell` off for a run of a few files or a grep. `outputFile` writes every cell's
outcome as JSON.

## Upgrading from 0.2

- `overlaysSettled` no longer waits on `whenOverlaysSettle` callbacks, which ui 0.16 removes. From ui 0.16 an overlay
  frees the page and hands focus on as it starts to close, so a test can act straight after closing one
