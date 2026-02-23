# @b3/testing

Shared test utilities for B3 apps. **Install as a `devDependency` only — never in production.**

## Installation

```bash
pnpm add -D @b3/testing
```

## renderWithProviders

A pre-wrapped `render` function with all providers (React Query, ChakraProvider) configured for tests:

```tsx
import { renderWithProviders } from "@b3/testing";
import { screen } from "@testing-library/react";

it("renders user name", () => {
  renderWithProviders(<UserCard userId="1" />);
  expect(screen.getByText("Test User")).toBeInTheDocument();
});
```

## Shared MSW handlers

```ts
import { setupServer } from "msw/node";
import { authHandlers, userHandlers } from "@b3/testing/handlers";

const server = setupServer(...authHandlers, ...userHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Override a handler in a specific test:

```ts
import { http, HttpResponse } from "msw";

server.use(
  http.get("/api/users/:id", () =>
    HttpResponse.json({ id: "1", name: "Other User", email: "other@example.com" }),
  ),
);
```

---

[Architecture guide](../../readme.md)
