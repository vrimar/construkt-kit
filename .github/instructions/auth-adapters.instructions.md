---
applyTo: "packages/auth-adapters/**"
---

Read `packages/auth-adapters/README.md` for full usage and custom adapter examples.

## Quick Reference

- `createAuth0AuthProvider(client: Auth0ClientLike)` → returns `AuthProvider` (from `@construkt-kit/pages`)
- **Duck-typing**: accepts `Auth0ClientLike` interface, not the actual Auth0 SDK — no direct SDK dependency

## Auth0ClientLike Interface

```ts
interface Auth0ClientLike {
  getAccessTokenSilently(): Promise<string>;
  loginWithRedirect(options?: unknown): Promise<void>;
  logout(options?: { logoutParams?: { returnTo?: string } }): void | Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getUser(): Promise<{ sub?: string; email?: string; name?: string } | undefined>;
}
```

## Design Decisions

- **Errors are swallowed**: `getToken`, `isAuthenticated`, `getUser` return `null`/`false` on failure instead of throwing — apps should add their own error logging if needed
- **Field mapping**: Auth0 `sub` → `User.id`; `email` and `name` pass through
- **Logout**: calls `client.logout({ logoutParams: { returnTo: window.location.origin } })`

## Adding a New Adapter

1. Create `src/<provider>.ts` (e.g., `src/msal.ts`)
2. Define a `<Provider>ClientLike` interface (duck-type the SDK)
3. Export `create<Provider>AuthProvider(client)` → `AuthProvider`
4. Re-export from `src/index.ts`
