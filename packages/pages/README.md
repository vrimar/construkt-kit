# @b3/pages

Shared full-page components for B3 apps. Pages own layout and UX — consuming apps own the wiring via props.

## Installation

```bash
pnpm add @b3/pages
```

## Pages

### LoginPage

```tsx
import { LoginPage } from '@b3/pages'

<LoginPage
  authProvider={authProvider}
  onSuccess={(token) => router.navigate({ to: '/dashboard' })}
  onForgotPassword={() => router.navigate({ to: '/forgot-password' })}
  logo={<CompanyLogo />}
/>
```

### AuthProvider interface

Pages accept an `authProvider` prop — implement it against your auth SDK:

```ts
import type { AuthProvider } from '@b3/pages'

export const authProvider: AuthProvider = {
  getToken: () => msalInstance.acquireTokenSilent(tokenRequest).then(r => r.accessToken),
  login: () => msalInstance.loginRedirect(),
  logout: () => msalInstance.logoutRedirect(),
  isAuthenticated: () => msalInstance.getAllAccounts().length > 0,
  getUser: () => msalInstance.getAllAccounts()[0] ?? null,
}
```

Pre-built adapters for MSAL and Auth0 are available in `@b3/auth-adapters`.

## Rules for shared pages

- Never import a specific router — accept navigation callbacks as props
- Never import a specific auth SDK — accept an `AuthProvider` adapter
- Never hardcode copy — accept strings as props or an optional `t` function
- Never reach into app-specific state

---

[Architecture guide](../../readme.md)
