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
  logo={<Logo />}
/>;
```

## Rules

- Accept navigation callbacks as props — never import a specific router
- Accept an `AuthProvider` adapter — never import a specific auth SDK
- Never reach into app-specific state
