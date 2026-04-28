# @construkt-kit/auth-adapters

Pre-built `AuthProvider` adapters for `@construkt-kit/pages`.

## Auth0

```ts
import { createAuth0AuthProvider } from "@construkt-kit/auth-adapters";

const authProvider = createAuth0AuthProvider(auth0Client);
```

Returns an `AuthProvider` (from `@construkt-kit/pages`) mapping `getToken`, `login`, `logout`, `isAuthenticated`, `getUser` to the Auth0 client. Accepts any object matching the `Auth0ClientLike` interface — no direct Auth0 SDK dependency.

## Custom Adapter

Implement the `AuthProvider` interface directly:

```ts
import type { AuthProvider } from "@construkt-kit/pages";

export const authProvider: AuthProvider = {
  getToken: async () => {
    /* ... */
  },
  login: async () => {
    /* ... */
  },
  logout: async () => {
    /* ... */
  },
  isAuthenticated: () => {
    /* sync or async */
  },
  getUser: () => {
    /* sync or async */
  },
};
```
