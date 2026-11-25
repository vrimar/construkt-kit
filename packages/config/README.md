# @construkt-kit/config

Shared tool configuration for Construkt Kit frontend projects.

## Sub-paths

| Import                             | Usage                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `@construkt-kit/config/typescript` | `"extends": "@construkt-kit/config/typescript"` in `tsconfig.json`            |
| `@construkt-kit/config/oxlint`     | `import baseConfig from "@construkt-kit/config/oxlint"` in `oxlint.config.ts` |
| `@construkt-kit/config/oxfmt`      | `export { default } from "@construkt-kit/config/oxfmt"` in `oxfmt.config.ts`  |
| `@construkt-kit/config/vite`       | `createViteConfig(overrides?)` factory                                        |
| `@construkt-kit/config/playwright` | `createPlaywrightConfig(options?)`: engine and device projects, tag routing   |
| `@construkt-kit/config/kubb`       | `createKubbConfig(options)` factory for OpenAPI codegen                       |
| `@construkt-kit/config/tsdown`     | `createTsdownConfig(options?)` factory; a given `entry` replaces the default  |
| `@construkt-kit/config/vitest`     | `installDomPolyfills()` and `createMatchMedia()` for jsdom Vitest setup files |

## Oxlint Config

The shared `@construkt-kit/config/oxlint` export now ships as a TypeScript config module.
Consume it from an `oxlint.config.ts` file and merge local overrides there.

This requires the Node-based `oxlint` runtime with a Node version new enough to
execute TypeScript config files.

The base config loads the `construkt` JS plugin and turns on `construkt/no-style-prop-name`. It reports a component
prop named after a Panda style prop (`content`, `width`, `fill`, …): Panda extracts such a prop as CSS from every
PascalCase JSX element, and free text there emits invalid CSS. The rule reads the style props from the app's own
generated Panda runtime: by default the `styled-system/` nearest each linted file, in its directory or an ancestor, so
one lint from a workspace root covers every app. Name it when it lives elsewhere; a relative path resolves from where
oxlint runs:

```ts
export default createOxlintConfig({
  settings: { construkt: { styledSystem: path.join(import.meta.dirname, "src/styled-system") } },
});
```

Without a `styled-system/` the rule does nothing; a `styledSystem` that names a missing directory fails the lint.
`jsPlugins` passed to `createOxlintConfig` add to the base's. `construkt/no-literal-style-props`, off by default,
reports style props and `css` on components in source that no Panda build extracts.

## Oxfmt Config

The shared `@construkt-kit/config/oxfmt` base enables Oxc import sorting via `sortImports: true`, so consuming packages inherit automatic import ordering without additional local config.

## Vite Config

`createViteConfig(overrides?)` returns a merged Vite config using Vite's `mergeConfig()` (properly merges plugin arrays, not shallow).

## Playwright Config

`createPlaywrightConfig(options?)` returns a config over the preset's projects (`PRESET_PROJECTS`): `chromium`,
`firefox` and `webkit` on desktop, `mac` (Chromium reporting macOS), `phone-ios` (WebKit), `phone-android` (Chromium)
and `tablet` (WebKit). `options.projects` picks them; the three desktop engines run by default. Tags route tests:

| Tag                                        | Runs on                                 |
| ------------------------------------------ | --------------------------------------- |
| none                                       | the desktop engines                     |
| `@mac`, `@phone`, `@tablet`                | also `mac`, the phones, `tablet`        |
| `@mac-only`, `@phone-only`, `@tablet-only` | only there                              |
| `@chromium-only`                           | desktop Chromium, not Firefox or WebKit |

`mac`, `phone-ios` and `tablet` set the `platform` option, which `@construkt-kit/testing`'s `test` turns into
`navigator.platform` and `userAgentData`; a device preset alone leaves them at the host's. Traces are kept on failure
locally and on the first retry in CI, which retries once. `options.reporters` run after the console reporter, such as
`["@construkt-kit/testing/reporter", { cells }]`. The preset starts no server: pass `webServer`, or start one per worker
with `@construkt-kit/testing`'s `startServer`.

## Vitest Setup

`installDomPolyfills()` installs no-op `ResizeObserver`, `IntersectionObserver`, `Element#scrollTo`,
`Element#scrollIntoView`, `Element#setPointerCapture`, `Element#getAnimations`, `showPopover`, `hidePopover`, `togglePopover` and the `<dialog>` methods `showModal`, `show` and `close`, which jsdom lacks and the kit's components call. An API the
environment already has stays. It doesn't register Testing Library's `cleanup`, which only registers itself under
Vitest `globals`:

```ts
import { installDomPolyfills } from "@construkt-kit/config/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

installDomPolyfills();
afterEach(cleanup);
```

`createMatchMedia(initial)` returns a `matchMedia` for jsdom, which has none. `initial` answers every query, or each
query through a `MediaMatcher` function; `setMatches(next)` changes the answer and notifies every `change` listener:

```ts
import { createMatchMedia } from "@construkt-kit/config/vitest";

const media = createMatchMedia((query) => query === "(max-width: 767px)");
window.matchMedia = media.matchMedia;
media.setMatches(false);
```

## Kubb Config (OpenAPI Codegen)

`createKubbConfig(options?)` generates a Kubb v5 config that produces 3 output directories plus the
bundled fetch runtime:

| Output dir | Content                               | Plugin             |
| ---------- | ------------------------------------- | ------------------ |
| `dtos/`    | TypeScript types from OpenAPI schemas | `pluginTs`         |
| `calls/`   | API call functions                    | `pluginFetch`      |
| `hooks/`   | React Query hooks (grouped by path)   | `pluginReactQuery` |
| `.kubb/`   | Fetch client runtime and serializers  | `pluginFetch`      |

Options (all optional):

| Option       | Default                  | Description                            |
| ------------ | ------------------------ | -------------------------------------- |
| `inputPath`  | `./src/api/openapi.json` | Path to OpenAPI spec                   |
| `outputPath` | `./src/api/gen`          | Output directory                       |
| `overrides`  | `{}`                     | Merged over the config; arrays replace |

Key behaviors:

- **Grouped arguments**: every call and hook takes one `{ path, query, body, headers }` object
- **Hooks opted in**: `hooks: true` — `use*` wrappers alongside the `queryOptions` helpers
- **Named barrels**: an `index.ts` per output directory and one at the root
- **`int64` as `number`**: `integerType: "number"`, matching what `JSON.parse` produces
- **Client configuration**: apps wire the generated `.kubb/client` up with `configureApiClient` from `@construkt-kit/api`

The peer Kubb packages (`kubb`, `@kubb/adapter-oas`, `@kubb/plugin-ts`, `@kubb/plugin-fetch`,
`@kubb/plugin-react-query`) are optional — install them in apps that run codegen.

## Upgrading from 0.8.0

- `createViteConfig` no longer opens a browser tab on start, so `vite preview` runs in tests and CI stay headless. Pass
  `--open` where you want one, such as an editor's dev task, or set `server.open` in the overrides

## Upgrading from 0.7

- The base oxlint config loads the `construkt` JS plugin and reports `construkt/no-style-prop-name` as an error. Rename
  every component prop named after a Panda style prop (`content`, `width`, `fill`, `cursor`, …), including props typed
  through `forwardRef`, `memo` or a class component's `Component<Props>`
- The rule reads the style props from the `styled-system/` nearest each linted file, so run Panda codegen before
  linting, in CI too: without a generated runtime the rule checks nothing. A `settings.construkt.styledSystem` that
  names a missing directory fails the lint
- `installDomPolyfills()` also installs `Element#getAnimations`, `showPopover`, `hidePopover`, `togglePopover` and the
  `<dialog>` methods `showModal`, `show` and `close`; drop any stubs of these from your test setup

## Upgrading from 0.6

- Apps that run codegen need `kubb` and `@kubb/adapter-oas` 5.20.2 or later, `@kubb/plugin-fetch` 6.0.4,
  `@kubb/plugin-react-query` 5.10.4 and `@kubb/plugin-ts` 5.5.4, on Node 22.22 or later. Upgrade `kubb` and
  `@kubb/plugin-fetch` together: `@kubb/plugin-fetch` 5 under `kubb` 5.20 generates hooks that import calls that don't
  exist (`getApiProjects2`)
- Regenerate and run `tsc`; `@construkt-kit/api`'s "Upgrading from 0.5" covers `configureApiClient`. In the generated
  client:
  - `responseType` is `parseAs`, and an operation with only binary success bodies is generated with `parseAs: 'blob'`
  - A custom `transport` returns a web `Response`, built with `toRequestInit(request)`, or wraps `defaultTransport`
  - `client.interceptors.error` handlers get network, abort and parse errors too; narrow with `ResponseError.is`
  - `FetchOptions` is `NativeOptions`, `codecs` is `mediaTypes`, and `defaultQuerySerializer` and
    `defaultPathSerializer` are `serializeQuery` and `serializePath`
  - Results and `ResponseError` carry the response `headers`
  - `text/event-stream` and JSON Lines operations return a `StreamResult` to iterate
  - Hook and query-option `client` options no longer take `cookies` or `throwOnError`
- Regenerating also changes what the client sends:
  - An object query parameter without a `style` goes out as `name=odie`, not `filter[name]=odie`, unless the client
    is set up with `@construkt-kit/api`'s `configureApiClient`, which keeps the brackets
  - An array or object header parameter goes out as `X-Ids: 3,4` instead of JSON, and a space in a query value as
    `%20`
  - `body: null` is sent as the JSON document `null`

## Upgrading from 0.5

- Apps that run codegen need `kubb` and `@kubb/adapter-oas` 5.15.3 or later, `@kubb/plugin-fetch` 5.11,
  `@kubb/plugin-react-query` 5.9 and `@kubb/plugin-ts` 5.4. The plugins no longer declare a peer on `kubb`, so these
  ranges are what keeps the two in step
- `inputPath` and `outputPath` resolve against the config file's folder, not the working directory; keep the config
  at the project root or pass absolute paths
- `defineConfig` rejects unknown keys, so a misspelled key in `overrides` now fails codegen
- Regenerating rewrites every generated file, and the generated client changes what it sends:
  - Parameters described with `content: application/json` go out as one JSON-encoded value instead of `deepObject`
  - JSON bodies send the operation's declared media type, and string bodies are JSON-encoded
  - URL-encoded bodies omit `null` and `undefined` properties
  - Client and call `headers` merge case-insensitively, with the call winning
  - Operations named after a reserved word get a `_` prefix
- `text/event-stream` operations get no React Query hooks; use the generated streaming client
- A JSON spec with a duplicate key fails with `KUBB_INVALID_DOCUMENT`, and a malformed `servers[].url` is rejected
