---
applyTo: "packages/pages/**"
---

Read `packages/pages/README.md` for full props, AuthProvider interface, and usage examples.

## Quick Reference

- Exports: `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AuthProvider`, `User`, `LoginOptions`
- **Adapter pattern**: pages accept an `AuthProvider` interface — never import a specific auth SDK
- **Callback-driven**: all navigation via callbacks (`onSubmit`, `onForgotPassword`, `onBack`) — no router dependency
- **Layout ownership**: pages render their own layout via `AuthLayout`; consuming apps inject `logo`, callbacks, etc.

## AuthProvider Interface

```ts
interface AuthProvider {
  getToken: () => Promise<string | null>;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean> | boolean; // sync or async
  getUser: () => Promise<User | null> | User | null; // sync or async
}
```

## Dependencies

- Uses `@construkt-kit/ui` components (`Button`, `Field`, `Input`, `Stack`, `Alert`)
- `AuthProvider` type is consumed by `@construkt-kit/auth-adapters`
- Consumed by apps (not by other monorepo packages)

## Conventions

- Named exports only
- Pages manage only form state — no auth state, no routing state
- Keep pages framework-agnostic (no Next.js/Remix-specific code)
