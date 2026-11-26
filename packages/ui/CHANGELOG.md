# @construkt-kit/ui

## 0.16.1 — 2026-11-26

### Fixes

- Let a tree mark its selection with the menus' blue tint through selection="tint" (`79b43e10`)
- Give a checked tint row blue text on its blue tint, so a picked menu row reads as picked (`ca4814f2`)

## 0.16.0 — 2026-11-24

### Breaking

- Free the page and hand focus on as an overlay starts closing, replacing whenOverlaysSettle (`9431dccf`)

### Features

- Add Toaster placement, with bottom-end stacking toasts up from the bottom of the viewport (`08ba4cd9`)
- Add scrollTree and revealTreeItem testing helpers for VirtualTree (`01d743ab`)

### Fixes

- Leave the caret alone when a combobox refocuses an input that already has focus (`90d031ac`)
- Let a press through a leaving toast, and keep a hovered stack spread while one leaves (`9573cf71`)
- Hide a closing dialog from the accessibility tree while it animates out (`51b38ec4`)
- Focus TagSelect's trigger on a press, not the tag list inside it (`913099ea`)
- Update useLatestRef before layout effect cleanups, so a close reads the props it closed with (`9d6443ea`)

## 0.15.0 — 2026-11-23

### Breaking

- Run every component on the kit's own primitives (`d183f893`)

### Features

- Add a /testing subpath of Playwright helpers for the kit's components (`74f432c1`)
- Check a TreeSelectList leaf when its row is clicked (`42bb6126`)
- Split TreeSelectList into useTreeSelectList and its parts (`34e93749`)

### Fixes

- Take a FileUpload drop that comes before React renders its dragover (`0d129d12`)
- Take a file with no path on disk, such as one dragged out of a page, in FileUpload (`120cf536`)

### Other

- Share popup, list and form-field layers across components (`374830c9`)
- Share codemod helpers (`cfc64906`)

### Package

- Drop dependency @ark-ui/react
- Add dependency @floating-ui/react-dom ^2.1.9
- Add dependency @internationalized/date ^3.12.4
- Add dependency @internationalized/number ^3.6.9
- Drop peer dependency @fontsource-variable/inter
- Add peer dependency @playwright/test ^1.62.1
- Add peer dependency inter-ui ^4.1.1
- Peer react ^19.0.0 → ^19.3.0
- Peer react-dom ^19.0.0 → ^19.3.0
- Change `peerDependenciesMeta` in package.json
- Change `exports` in package.json
- Change `files` in package.json

## 0.14.0 — 2026-11-18

### Breaking

- Re-render only the rows that enter a virtual list (`1bf8acb`)

### Features

- Add TooltipGroup to run one tooltip for a whole list (`c3dde32`)

### Fixes

- Show DataTable cards on a phone on its side and wrap a crowded cards toolbar (`1428534`)
- Title DataTable date cells with a readable date, not the raw timestamp (`34a3b35`)
- Name, describe and invalidate Select and DatePicker triggers from their Field (`0393d4e`)
- Show a faint scrollbar thumb on Listbox so long lists look scrollable (`8baa83c`)
- Never give a close trigger initial focus (`6e1f315`)
- Open a destructive ConfirmPopover with focus on Cancel (`7e263ac`)
- Open DeleteDialog with focus on Cancel, not Delete (`78ee97c`)

### Other

- Read tree check state only in checkable trees (`03dd458`)

## 0.13.0 — 2026-11-18

### Breaking

- Render Listbox items with actions as grid rows (`42fdceb`)
- Expose TreeView checks on the row and toggle them with Space (`73298a2`)
- Fix CheckboxCard a11y and input edge cases (`9cec005`)
- Fix focus, alignment and overlap bugs from a browser review (`e5d7b7c`)
- Consolidate shared primitives and unify public names (`24ee026`)

### Features

- Share SegmentGroup and ToggleGroup's enclosed and outline looks (`f861ce2`)
- Soften an inactive SelectButton's sublabel to fg.subtle (`b581b0c`)
- Add Menu.SwitchItem for settings that turn on and off (`65c556a`)
- Default SelectButton and field filters to outline to match inputs (`7a08a00`)
- Add an emptyState slot to DataTable and Listbox (`6447d91`)
- Add a trigger tooltip to ConfirmPopover (`898fcc2`)
- Add VirtualTree and build TreeSelectList on it (`d61051a`)
- Fit a Listbox edge to edge in a Popover and add Popover.Footer stretch (`354b5b4`)
- Add Menu.SegmentGroup and caps group labels (`73fee83`)
- Add resolveColor to read token colors as hex (`771b017`)
- Add stop, mic-loading and read-only states to Composer (`080f4ea`)
- Add typed drag-and-drop hooks for drags between elements (`b28c3dd`)
- Add useHotkeyHandler; export announcer, refs (`aee5b71`)
- Add Chat, CommandPalette, Toolbar, HotkeyInput, NavRail, Tag (`44a40f0`)
- Refine Field, Editable, Progress, Spinner and Splitter (`8bd0410`)
- Add Sortable, sticky and renamable TreeSelectList, tree DnD (`6035ec9`)
- Add DataTable column visibility and resizing, DataList, List (`c8902ad`)
- Add usePointerDrag (`a4dff99`)
- Add Confirm/PromptPopover; fix tooltip, menu and listbox a11y (`35d9b1e`)
- Add SplitButton and clearable SelectButton, keep loading focus (`6deb096`)

### Fixes

- Stop VirtualTreeRow focusing its node on pointer down (`43eb2e3`)
- Let the splitter recipe own panel overflow so panels scroll (`e64a027`)
- Reveal a Listbox or Select selection that arrives after mount (`7141a72`)
- Name a Listbox's list with its aria-label (`80629bd`)
- Label DeleteDialog's confirm button "Delete" (`2721cd9`)
- Open a Menu that also has a context trigger at its button (`8906bfb`)
- Fix accessibility issues found by story tests (`9eb79d0`)
- Dim disabled and lay out horizontal RadioCards, honour end placement (`bfdd7c0`)
- Fix tree, list, select, overlay and virtual-scroll bugs (`ef615e2`)

### Package

- @ark-ui/react ~5.39.3 → ~5.40.0
- lucide-react ^1.67.0 → ^1.73.0
- react-resizable-panels ^4.18.0 → ^4.24.0
- Drop dependency react-use
- Change `license` in package.json
