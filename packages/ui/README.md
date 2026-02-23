# @b3/ui

Shared component library for all B3 frontend apps. Built on Chakra UI v3 — components are wrapped so the internal API can evolve independently of Chakra's versioning.

## Installation

```bash
pnpm add @b3/ui
```

Peer dependencies (install alongside):

```bash
pnpm add @chakra-ui/react react react-dom
```

## Setup

Wrap your app root with `ChakraProvider` using the shared theme:

```tsx
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@b3/ui/theme'

<ChakraProvider value={system}>
  <App />
</ChakraProvider>
```

## Components

| Component | Description |
|-----------|-------------|
| `<Button>` | Themed button extending Chakra's Button |
| `<ErrorBoundary>` | Error boundary with Sentry capture and custom fallback support |

## Hooks

| Hook | Description |
|------|-------------|
| `useDebounce(value, delay?)` | Debounces a value |
| `useMediaQuery(query)` | Returns whether a media query matches |

## Design tokens

```ts
import { colors, spacing, typography, breakpoints } from '@b3/ui'
```

## Storybook

The published Storybook is the primary component reference — all props are documented and interactive.

---

[Architecture guide](../../readme.md)
