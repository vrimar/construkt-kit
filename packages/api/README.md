# @b3/api

HTTP client, query factories, typed error classes, React Query setup, and generated API types for B3 apps.

## Installation

```bash
pnpm add @b3/api @tanstack/react-query
```

## Setup

```ts
// lib/api.ts
import { createApiClient } from '@b3/api'

export const apiClient = createApiClient({
  baseUrl: env.VITE_API_URL,
  getToken: authProvider.getToken,
  onUnauthorized: () => authProvider.login(),
})
```

```ts
// lib/queryClient.ts
import { createQueryClient } from '@b3/api'

export const queryClient = createQueryClient()
```

## Generated types

Run `pnpm generate` in this package to regenerate types from the OpenAPI spec:

```bash
# fetch the latest spec first, then:
pnpm generate
```

Generated output lives in `src/generated/` and is committed to source control — consumers do not run generation. A CI check fails if committed output is out of date with `openapi.json`.

## Error handling

```ts
import { ApiError, NotFoundError, UnauthorizedError } from '@b3/api'

try {
  await apiClient.get('users/123').json()
} catch (error) {
  if (error instanceof NotFoundError) { /* 404 */ }
  if (error instanceof UnauthorizedError) { /* 401 */ }
  if (error instanceof ApiError) { /* other API error */ }
}
```

---

[Architecture guide](../../readme.md) · [ADR 006 — orval for type generation](../../docs/decisions/006-orval-for-api-type-generation.md)
