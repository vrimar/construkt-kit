# @construkt-kit/pages

Shared auth page components for Construkt Kit apps. Pages own layout — consuming apps wire behavior via props.

## Exports

| Export               | Props                                                  |
| -------------------- | ------------------------------------------------------ |
| `LoginPage`          | `onSubmit`, `isLoading?`, `logo?`, `onForgotPassword?` |
| `ForgotPasswordPage` | `ForgotPasswordPageProps`                              |
| `ResetPasswordPage`  | `ResetPasswordPageProps`                               |

**Types:** `AuthProvider`, `User`, `LoginOptions`, `LoginPageProps`, `ForgotPasswordPageProps`, `ResetPasswordPageProps`

## AuthProvider Interface

Shipped as a type for apps to implement against their auth SDK. The pages themselves take plain
callbacks (`onSubmit`, `onForgotPassword`, …) and never receive a provider.

```ts
interface AuthProvider {
  getToken: () => Promise<string | null>;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean> | boolean; // sync or async
  getUser: () => Promise<User | null> | User | null; // sync or async
}
```

`isAuthenticated()` and `getUser()` accept both sync and async return types — allows Auth0 (sync cache) and MSAL (async) to both work.

## Usage

```tsx
import { LoginPage } from "@construkt-kit/pages";

<LoginPage
  onSubmit={(email, password) => mutate({ email, password })}
  isLoading={isPending}
  onForgotPassword={() => navigate("/forgot-password")}
  logo={
    <img
      src="/brand-mark.svg"
      alt="Acme"
    />
  }
/>;
```

## Panda CSS

pages is a Panda design system that extends `@construkt-kit/ui`. `panda lib` ships the styles these pages
use in `panda/`, so apps that use pages set `designSystem: "@construkt-kit/pages"` in place of
`"@construkt-kit/ui"`; Panda follows the chain and loads ui's theme and styles as well. Because pages is a nested
design system, those apps generate a full local `styled-system/` instead of re-exporting ui's runtime.

## Rules

- Accept navigation callbacks as props — never import a specific router
- Accept auth callbacks as props — never import a specific auth SDK
- Never reach into app-specific state
