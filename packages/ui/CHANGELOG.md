# @construkt-kit/ui

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
