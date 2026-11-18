# @construkt-kit/preset

## 0.11.0 — 2026-11-18

### Breaking

- Generate color palettes from key colors, checked for contrast (`33f8f45`)
- Fix focus, alignment and overlap bugs from a browser review (`e5d7b7c`)
- Consolidate shared primitives and unify public names (`24ee026`)

### Features

- Share SegmentGroup and ToggleGroup's enclosed and outline looks (`f861ce2`)
- Add Menu.SwitchItem for settings that turn on and off (`65c556a`)
- Lighten control edges to match outline buttons (`bcdf8c5`)
- Add a tint selection variant to listbox (`1a13322`)
- Fit a Listbox edge to edge in a Popover and add Popover.Footer stretch (`354b5b4`)
- Hover list, menu, tree and table rows with bg.hover (`1ff6155`)
- Tint dark greys slate and solve hover states against their surface (`f8ad022`)
- Add Menu.SegmentGroup and caps group labels (`73fee83`)
- Lighten light-theme greys, tint text greys slate, lower control edges to 2.2:1 (`44a5710`)
- Add Chat, CommandPalette, Toolbar, HotkeyInput, NavRail, Tag (`44a40f0`)
- Refine Field, Editable, Progress, Spinner and Splitter (`8bd0410`)
- Add Sortable, sticky and renamable TreeSelectList, tree DnD (`6035ec9`)
- Add DataTable column visibility and resizing, DataList, List (`c8902ad`)
- Add Confirm/PromptPopover; fix tooltip, menu and listbox a11y (`35d9b1e`)
- Add SplitButton and clearable SelectButton, keep loading focus (`6deb096`)
- Add density modes, nested color scopes and highlight motion (`753e111`)

### Fixes

- Stop sheets freezing text mid-slide via will-change (`98bada9`)
- Label green solids white like the other status palettes (`86d3a5b`)
- Draw the segment group border over its indicator (`4fe5747`)
- Let the splitter recipe own panel overflow so panels scroll (`e64a027`)
- Floor small control text at fontSizes.xs and snap line-heights to even pixels (`42247fd`)
- Add colorPalette.control for 3:1 tinted control edges (`46f5582`)
- Move recipes onto contrast-safe color roles (`80bafdf`)
- Dim a disabled FileUpload and hide a read-only one's controls (`81d680a`)
- Dim disabled and lay out horizontal RadioCards, honour end placement (`bfdd7c0`)

### Package

- @ark-ui/react ~5.39.3 → ~5.40.0
- Change `license` in package.json
