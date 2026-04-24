---
applyTo: "packages/ui/**"
---

Read `packages/ui/README.md` for full component list, implementation patterns, theme architecture, and token syntax.

## Component Patterns (3 templates)

1. **Styled wrapper** — simple components: `export const Badge = styled(ArkBadge, badgeRecipe)`
2. **Compound + style context** — Ark UI compounds: create slot recipe, use `createStyleContext()`, export compound parts
3. **Compound + custom context** — complex components (DataTable, Form): custom context provider distributing props

## File Structure

```
src/components/ComponentName/
  ComponentName.tsx    ← main implementation
  ComponentName.stories.tsx  ← Storybook story (autodocs)
  index.ts             ← barrel re-export
```

Then add the barrel export in `src/components/index.ts` and `src/index.ts`.

## Checklist (new component)

- [ ] Create folder under `src/components/`
- [ ] Use `styled()` from `@b3/styled-system/jsx`
- [ ] Use `createStyleContext()` for Ark UI compound components
- [ ] Define recipe/slot recipe in the component file or `../preset/src/theme/`
- [ ] Export all parts as named exports (no default exports)
- [ ] Add Storybook story with `autodocs` tag
- [ ] Add barrel exports up through `components/index.ts` → `index.ts`

## Token Paths

- Colors: `colors.bg.default`, `colors.fg.muted`, `colors.border.default`
- Spacing: `spacing.1` through `spacing.12`
- Sizes: `sizes.xs`, `sizes.sm`, `sizes.md`, `sizes.lg`, `sizes.xl`
- Radii: `radii.sm`, `radii.md`, `radii.lg`

## Rules

- Never import styling helpers from `styled-system/*`; use `@b3/styled-system/*`
- Never use hardcoded colors (`#hex`, `rgb()`, `hsl()`) — always Panda tokens
- Named exports only
- `react` / `react-dom` are peer deps — never add to `dependencies`
