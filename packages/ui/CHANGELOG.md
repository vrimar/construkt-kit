# @construkt-kit/ui

## 0.3.0

### Minor Changes

- 296c161: Consuming apps now generate the Panda runtime themselves — `@construkt-kit/styled-system` is no
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

### Patch Changes

- Updated dependencies [296c161]
  - @construkt-kit/utils@0.2.0

## 0.2.0

### Minor Changes

- Add `SimpleGrid`, shared `breakpoints`, and `useMediaQuery`; fix NumberInput, LoadingOverlay, Menu, Popover/Tooltip triggers.

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @construkt-kit/preset@0.2.0
  - @construkt-kit/utils@0.1.3
  - @construkt-kit/styled-system@0.1.3
