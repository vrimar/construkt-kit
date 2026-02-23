# @b3/config

Shared tool configuration for all B3 frontend projects — TypeScript, Oxlint, Oxfmt, Vite, and Playwright.

## Installation

```bash
pnpm add -D @b3/config
```

## Usage

### TypeScript

```json
// tsconfig.json
{
  "extends": "@b3/config/typescript",
  "include": ["src"]
}
```

### Oxfmt

```jsonc
// .oxfmtrc.jsonc
"@b3/config/oxfmt"
```

Run manually or via CI:

```bash
npx oxfmt --check .   # CI
npx oxfmt .           # fix
```

### Oxlint

```json
// .oxlintrc.json
{
  "extends": ["@b3/config/oxlint"]
}
```

### Vite

```ts
// vite.config.ts
import { createViteConfig } from '@b3/config/vite'
export default createViteConfig({ base: '/my-app/' })
```

### Playwright

```ts
// playwright.config.ts
import { createPlaywrightConfig } from '@b3/config/playwright'
export default createPlaywrightConfig()
```

---

[Architecture guide](../../readme.md)
