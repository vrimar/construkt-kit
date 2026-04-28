---
applyTo: "packages/testing/**"
---

Read `packages/testing/README.md` for current status.

## Quick Reference

- **Status**: Stub — scaffolded but no public exports yet
- **Purpose**: Shared test infrastructure for Construct Kit apps (MSW request handlers, render helpers)
- **Install as**: `devDependency` only

## Sub-path Exports

| Sub-path                          | Status | Intended purpose            |
| --------------------------------- | ------ | --------------------------- |
| `@construct-kit/testing`          | Stub   | Shared render helpers, etc. |
| `@construct-kit/testing/handlers` | Stub   | MSW request handlers        |

## Dependencies (scaffolded, not yet used)

- `msw` — mock service worker for intercepting network requests
- `@tanstack/react-query` — for wrapping components with QueryClientProvider in tests
- `@testing-library/react` — for shared render utilities

## Conventions

- Named exports only
- Dev dependency in consuming apps — never ship to production
- MSW handlers should be reusable across Storybook and Vitest
