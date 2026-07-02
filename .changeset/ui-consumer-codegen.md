---
"@construkt-kit/ui": minor
---

Consuming apps now generate the Panda runtime themselves — `@construkt-kit/styled-system` is no
longer published.

`ui` keeps its `@construkt-kit/styled-system/*` imports external and moves `@construkt-kit/preset`
to a peer dependency. A consuming app installs `@construkt-kit/ui` + `@construkt-kit/preset`, builds
its `panda.config` with `createConstruktPandaConfig` from `@construkt-kit/ui/panda` (or composes
`construktKitPreset` itself), runs `panda codegen` to emit its own styled-system, and aliases
`@construkt-kit/styled-system/*` to that output.

Because a single preset now generates both the runtime and the CSS at the consumer, token/recipe
drift is structurally impossible, and apps can structurally override ui's built-in recipes.

BREAKING: apps must run Panda codegen and alias `@construkt-kit/styled-system`; they no longer
install `@construkt-kit/styled-system` as a package.

Also ships ESM-only — the CommonJS build and `require` export conditions were dropped (see the
`esm-only` changeset).
