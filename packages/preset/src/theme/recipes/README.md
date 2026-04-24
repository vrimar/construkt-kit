# Recipe Conventions

## Variant Vocabulary

Standard variant names across all recipes, from most visual weight to least:

| Variant   | Description                         | Tokens Used              |
| --------- | ----------------------------------- | ------------------------ |
| `solid`   | Filled background, high contrast    | `colorPalette.solid.*`   |
| `surface` | Subtle background + border          | `colorPalette.surface.*` |
| `subtle`  | Light tinted background, no border  | `colorPalette.subtle.*`  |
| `outline` | Border only, transparent background | `colorPalette.outline.*` |
| `plain`   | Text only, no background or border  | `colorPalette.plain.*`   |

**Special cases:**

- **Input / Textarea** also have `flushed` (bottom border only) and `colored` (colorPalette-aware outline).
  Default variants use `neutral.*` tokens (swappable neutral palette, defaults to gray).
- **Skeleton** uses `animation` (not `variant`) with values `pulse`, `shine`, `none`.

## Size Tiers

| Tier       | Sizes                                | Used By                                              |
| ---------- | ------------------------------------ | ---------------------------------------------------- |
| Full       | `2xs` `xs` `sm` `md` `lg` `xl` `2xl` | Button                                               |
| Extended   | `2xs` `xs` `sm` `md` `lg` `xl` `2xl` | Input                                                |
| Standard   | `xs` `sm` `md` `lg` `xl` `2xl`       | Badge                                                |
| Default    | `xs` `sm` `md` `lg` `xl`             | Code, Kbd, Progress                                  |
| Compact    | `sm` `md` `lg`                       | Accordion, Alert, Checkbox, RadioGroup, Slider, Stat |
| Minimal    | `xs` `sm` `md` `lg`                  | Switch                                               |
| Per-recipe | varies                               | Textarea (xs–xl), Toggle Group (none)                |

## Defaults

- Default variant: `solid` for action components, `outline` for form inputs, `subtle` for display components
- Default size: `md` for all recipes

## colorPalette

All variant tokens reference `colorPalette.*` so consumers control color via the `colorPalette` prop.
Form controls (Input, Textarea) default to `neutral.*` tokens; use the `colored` variant for colorPalette-aware styling.

## neutral tokens

Recipes use `neutral.*` (not `gray.*`) for default chrome — control surfaces, borders, backgrounds.
`neutral` is defined in `semantic-tokens/colors.ts` as an alias for a color palette (slate by default).
To change the neutral hue globally, update the single `neutral: colorPalette("slate")` line to another palette.

| I'm styling…           | Use              |
| ---------------------- | ---------------- |
| Page background/layout | `bg.*`           |
| Body text, headings    | `fg.*`           |
| Section dividers       | `border.*`       |
| Component defaults     | `neutral.*`      |
| Active/branded state   | `colorPalette.*` |
