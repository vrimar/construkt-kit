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
| `bg.emphasized`                                       | Selected rows                                                                      |
| `fg`, `fg.muted`                                      | Body text, secondary text — pass on every surface                                  |
| `fg.subtle`                                           | Placeholders, hints, captions — never on `bg.emphasized` or a pressed/checked tint |
| `border`                                              | Dividers and card edges                                                            |
| `border.control`                                      | Edges of inputs, checkboxes, radios and switches (3:1)                             |
| `colorPalette.{solid,surface,subtle,outline,plain}.*` | Component variants                                                                 |
| `colorPalette.fg`                                     | Accent text and marks                                                              |
| `colorPalette.control`                                | Tinted control edges and soft ranges; 3:1 on the page and on `subtle.bg` tracks    |
| `colorPalette.focusRing`                              | Focus rings, set globally                                                          |
| `danger`, `warning`, `success`, `info`                | Status palettes; `fg.error`/`border.error` etc. for form states                    |

Tracks (slider, progress) sit on `subtle.bg`, the step every solid fill is guaranteed 3:1 against.
