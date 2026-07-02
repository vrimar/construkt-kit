# @construkt-kit/api

## 0.2.0

### Minor Changes

- 296c161: Ship ESM-only.

  Dropped the CommonJS build (`format: ["esm"]`) and the `require`/`.cjs` export conditions across
  all packages. Each entry now resolves through a single flat `{ "types": "*.d.mts", "default":
"*.mjs" }` condition — ESM `import` uses it directly, and modern Node (`require(esm)`, Node ≥ 20.19 /
  22.12) resolves the same `default` for `require()`.

  BREAKING: a CommonJS consumer on older Node that cannot use `require(esm)` can no longer load these
  packages. All supported consumers (Vite / Vitest / React 19 / Node ≥ 20.19) are unaffected.

## 0.1.3

### Patch Changes

- Bump runtime deps: `@kubb/*`, `tsx`.
