# @b3/auth-adapters

Pre-built `AuthProvider` adapter implementations for common auth providers.

## Installation

```bash
pnpm add @b3/auth-adapters @auth0/auth0-react
```

## Auth0

```ts
import { createAuth0AuthProvider } from '@b3/auth-adapters/auth0'
import { createAuth0Client } from '@auth0/auth0-react'

const auth0Client = await createAuth0Client({
  domain: env.VITE_AUTH0_DOMAIN,
  clientId: env.VITE_AUTH0_CLIENT_ID,
})

export const authProvider = createAuth0AuthProvider(auth0Client)
```

## Custom adapter

If your provider is not listed, implement the `AuthProvider` interface from `@b3/pages` directly:

```ts
import type { AuthProvider } from '@b3/pages'

export const authProvider: AuthProvider = {
  getToken: async () => { /* ... */ },
  login: async () => { /* ... */ },
  logout: async () => { /* ... */ },
  isAuthenticated: () => { /* ... */ },
  getUser: () => { /* ... */ },
}
```

---

[Architecture guide](../../readme.md)
