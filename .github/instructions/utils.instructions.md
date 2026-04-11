---
applyTo: "packages/utils/**"
---

Read `packages/utils/README.md` for full export table and examples.

## Quick Reference

- One file per domain: `array`, `date`, `enum`, `number`, `object`, `query`, `string`, `validation`
- All functions are **stateless, framework-agnostic** — no React, no side effects
- Named exports only; everything re-exported from `src/index.ts`
- Uses `dayjs` internally for date formatting (not re-exported)
- Uses `Zod` for validation schemas (`emailSchema`, `phoneSchema`, `passwordSchema`, `loginSchema`)

## Key Patterns

- **Enum helpers** handle both numeric and string TS enums; `enumToOptions` returns `{ label, value }[]` for selects
- **Tree traversal** (`findInTree`) is depth-first predicate search — no cycle detection
- **Query building** (`buildQueryString`) recursively handles nested objects/arrays; omits `undefined`/`null`
- **File utilities** (`saveBlobResponse`, `downloadFile`) sanitize filenames to prevent path traversal
- **Number parsing** (`toInt`, `isStrictlyNumeric` in `number.ts`) returns `0` for invalid input — never throws
- **Number validation** (`isValidNumber` in `number.ts`) returns `boolean` — handles strings and numbers

## Conventions

- New utility → add to the appropriate domain file, export from `index.ts`
- Keep functions pure — no framework imports, no global state
- Prefer explicit parameter types over `any`
