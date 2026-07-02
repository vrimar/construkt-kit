---
"@construkt-kit/api": minor
"@construkt-kit/config": minor
"@construkt-kit/pages": minor
"@construkt-kit/preset": minor
"@construkt-kit/utils": minor
---

Ship ESM-only.

Dropped the CommonJS build (`format: ["esm"]`) and the `require`/`.cjs` export conditions across
all packages. Each entry now resolves through a single flat `{ "types": "*.d.mts", "default":
"*.mjs" }` condition — ESM `import` uses it directly, and modern Node (`require(esm)`, Node ≥ 20.19 /
22.12) resolves the same `default` for `require()`.

BREAKING: a CommonJS consumer on older Node that cannot use `require(esm)` can no longer load these
packages. All supported consumers (Vite / Vitest / React 19 / Node ≥ 20.19) are unaffected.
