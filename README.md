# Construkt Kit

React 19 kit on Panda CSS and its own React primitives: components, auth pages, a virtualized data grid, an API
client and shared tool configs.

## Packages

| Package                                                    | What                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`@construkt-kit/ui`](packages/ui/README.md)               | Components, hooks and the Panda design system apps build on                 |
| [`@construkt-kit/pages`](packages/pages/README.md)         | Login, forgot-password and reset-password pages; extends ui's design system |
| [`@construkt-kit/data-grid`](packages/data-grid/README.md) | Virtualized, Excel-like grid with an opt-in Panda preset                    |
| [`@construkt-kit/preset`](packages/preset/README.md)       | Tokens, contrast-checked palettes and recipes                               |
| [`@construkt-kit/api`](packages/api/README.md)             | Kubb client setup, typed errors and query helpers                           |
| [`@construkt-kit/utils`](packages/utils/README.md)         | Framework-free helpers: dates, numbers, query strings, Zod schemas          |
| [`@construkt-kit/config`](packages/config/README.md)       | TypeScript, Vite, Vitest, oxlint, oxfmt, Playwright and Kubb configs        |

## Quick start

```sh
pnpm add @construkt-kit/ui inter-ui react react-dom
pnpm add -D @pandacss/dev
```

```ts
// panda.config.ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  designSystem: "@construkt-kit/ui", // "@construkt-kit/pages" when the app uses the auth pages
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
```

```tsx
import { Button } from "@construkt-kit/ui";

export const Save = () => <Button>Save</Button>;
```

Keep `@layer reset, base, tokens, recipes, utilities;` in the entry CSS, and import `css` and `styled` from the app's
own `styled-system/`, never from the kit. Details: [using ui in an app](packages/ui/README.md#consuming-construkt-kitui-in-apps).

## Developing

| Command                | Does                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| `pnpm install`         | Install the workspace                                              |
| `pnpm storybook`       | Browse every component                                             |
| `pnpm test:stories`    | Test every story: axe, accessibility tree and screenshots (Docker) |
| `pnpm release:prepare` | Bump versions, write changelogs and run every release gate         |

## License

[MIT](LICENSE)
