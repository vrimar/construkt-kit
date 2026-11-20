# @construkt-kit/preset

Shared Panda CSS preset for Construkt Kit frontend apps.

Exports `construktKitPreset`, the source of truth for tokens, semantic tokens, recipes,
conditions, keyframes, animation styles, and global CSS used by `@construkt-kit/ui` and
consumer apps that run Panda CSS, and `createConstruktKitPreset(options)` to build it with
your own palettes.

## Colours

Every colour is generated from one key colour per palette. Each shade is solved to a fixed
WCAG contrast against the page, in light and dark, so a role passes on every surface it is
designed to sit on, in every hover, pressed and checked state.

```ts
import { createConstruktKitPreset } from "@construkt-kit/preset";

export const preset = createConstruktKitPreset({
  palettes: { brand: { key: "#0a7d5a" }, lime: { key: "#84cc16" } },
});
```

- `palettes` replaces a built-in palette by name (`brand`, `red`, `orange`, `yellow`, `green`, `teal`, `cyan`,
  `blue`, `purple`, `pink`) or adds a new one; every palette becomes a `colorPalette` value. `neutral` sets the
  grey that surfaces, borders and text come from.
- A palette that cannot meet WCAG AA throws during `panda codegen`, naming each failing pair. Set `onSolid`
  (`"white"` or `"ink"`) or pick another key.
- There are no raw ramp steps (`brand.500`): use the roles below.

| Role                                                  | Use                                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `bg`, `bg.subtle`, `bg.muted`                         | Page and container backgrounds                                                     |
| `bg.hover`                                            | Hovered or highlighted rows: list, tree, table, menu and listbox items             |
| `bg.emphasized`                                       | Selected rows                                                                      |
| `fg`, `fg.muted`                                      | Body text, secondary text — pass on every surface                                  |
| `fg.subtle`                                           | Placeholders, hints, captions — never on `bg.emphasized` or a pressed/checked tint |
| `border`                                              | Dividers and card edges                                                            |
| `border.control`                                      | Edges of inputs, checkboxes, radios and switches; same as `neutral.outline.border` |
| `colorPalette.{solid,surface,subtle,outline,plain}.*` | Component variants; `outline.bg.*` and `plain.bg.*` are translucent overlays       |
| `colorPalette.fg`                                     | Accent text and marks                                                              |
| `colorPalette.control`                                | Tinted control edges and soft ranges; 3:1 on the page and on `subtle.bg` tracks    |
| `colorPalette.focusRing`                              | Focus rings, set globally                                                          |
| `danger`, `warning`, `success`, `info`                | Status palettes; `fg.error`/`border.error` etc. for form states                    |

Tracks (slider, progress) sit on `subtle.bg`, the step every solid fill is guaranteed 3:1 against.

## Upgrading from 0.11

- Inter loads from `inter-ui`, the official build, instead of `@fontsource-variable/inter`: swap the package. An app
  that imports fontsource's CSS itself should drop it, since it declares a second `"Inter Variable"` without the
  character variants
- Body text turns on Inter's tailed l and serifed I (`cv05`, `cv08`) through `--font-body-features`; set it to
  `normal` on `:root` for the previous glyphs or when `fonts.body` names another typeface
- The face carries Inter's optical-size axis, so text above 14px draws slightly tighter, headings most. Screenshot tests
  change
- `<body>` no longer gets `overflow: hidden`, so the page scrolls by default; an app with a fixed shell sets it itself

## Upgrading from 0.10

- Raw colour ramps are gone: `blue.500`, `brand.600`, `gray.200` and every other step. Use the roles above, or a
  `colorPalette` with a recipe variant
- `error.*` is `danger.*`, `gray.*` and `slate.*` are `neutral.*`, `<palette>.contrast` is `<palette>.solid.fg`, and
  `bg.success` is `success.subtle.bg` (`bg.success.hover` is `success.subtle.bg.hover`)
- With Panda's `strictTokens`, each removed token is a type error; without it, it is an unresolved CSS variable, so
  search the app for these names
- Every palette is regenerated from its key colour: light greys are lighter, `fg` is 13:1 and `fg.subtle` 5:1, and
  green solids are darker with white labels, so screenshot tests change
- Pass your own colours as `createConstruktKitPreset({ palettes, neutral })` key colours instead of overriding ramps
- Recipe changes that show in components are listed under ui's "Upgrading from 0.12"
