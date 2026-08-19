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

These pages use style props that exist nowhere in a consuming app's own source, so an app whose Panda
`include` covers only `./src` emits no CSS for them. The build ships `panda.buildinfo.json` with those
styles extracted, exported as `@construkt-kit/pages/panda.buildinfo.json`.

`createConstruktPandaConfig` from `@construkt-kit/ui/panda` appends it automatically when this package
is installed. Apps that build their Panda config by hand must add it to `include` themselves.

## Rules

- Accept navigation callbacks as props — never import a specific router
- Accept auth callbacks as props — never import a specific auth SDK
- Never reach into app-specific state
