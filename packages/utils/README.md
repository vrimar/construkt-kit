# @b3/utils

Stateless, framework-agnostic utilities shared across all B3 frontend apps. No React, no Chakra, no UI concerns.

## Installation

```bash
pnpm add @b3/utils
```

## What's included

| Export | Description |
|--------|-------------|
| `cn(...classes)` | Classname merging with Tailwind conflict resolution |
| `formatCurrency` / `formatDate` / `formatNumber` | Localised Intl formatters |
| `emailSchema` / `phoneSchema` / `passwordSchema` | Shared Zod validation schemas |
| `loginSchema` | Composed login form schema |
| `baseEnvSchema` + `parseEnv` | Zod-based env var validation |
| `featureEnabled(flag)` | Environment variable feature flags |
| `appUrls` | Cross-app navigation URLs |

## Environment variables

Apps must define the following in their `.env`:

```
VITE_API_URL=https://api.example.com
VITE_PORTAL_URL=https://portal.example.com
VITE_ADMIN_URL=https://admin.example.com
VITE_REPORTS_URL=https://reports.example.com
```

---

[Architecture guide](../../readme.md)
