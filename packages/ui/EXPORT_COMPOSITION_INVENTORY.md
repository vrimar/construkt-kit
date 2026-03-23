# @b3/ui Export And Composition Inventory

This inventory tracks the current export and composition patterns used by each top-level component family in `packages/ui/src/components`.

Goal: normalize the public API shape without forcing unrelated implementation details into one pattern.

## Canonical Taxonomy

| Category     | Definition                                 | Preferred Public Shape                                           |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| Primitive    | Single styled element or thin wrapper      | `Component`, `type ComponentProps`                               |
| Compound     | Multi-part component with slots            | `Component.Root`, `Component.Trigger`, `Component.Content`, etc. |
| Family       | Related components grouped in one folder   | Explicit named exports                                           |
| Feature      | Stateful or data-heavy component           | Explicit named exports                                           |
| Pass-through | Intentional re-export layer                | Explicit named exports                                           |
| Adapter      | Thin wrapper over another component family | Explicit named exports                                           |

## Inventory Matrix

| Folder            | Main Public Exports                                                                                                                      | Current Pattern        | Composition Mechanism                                | Desired Pattern           | Priority | Notes                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- | ------------------------- | -------- | ---------------------------------------------------------------------- |
| Accordion         | `Accordion`                                                                                                                              | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Actionbar         | `Actionbar`                                                                                                                              | Compound               | Popover-based wrapper                                | Compound                  | P2       | Needs clearer documentation                                            |
| Alert             | `Alert`, `ApiErrorAlert`                                                                                                                 | Family                 | Styled parts + custom logic                          | Family                    | P1       | Public shape should be clarified                                       |
| ApplyInput        | `ApplyInput`                                                                                                                             | Adapter                | Custom wrapper logic                                 | Adapter or Feature        | P1       | Classification is unclear                                              |
| ApplySelect       | `ApplySelect`                                                                                                                            | Adapter                | Custom wrapper + Select composition                  | Adapter or Feature        | P1       | Classification is unclear                                              |
| Avatar            | `Avatar`                                                                                                                                 | Compound               | `createStyleContext` + custom fallback               | Compound                  | P2       | Pattern is fine, document fallback wrapper                             |
| Badge             | `Badge`                                                                                                                                  | Primitive              | `styled(ark.div, recipe)`                            | Primitive                 | P3       | Already aligned                                                        |
| Breadcrumb        | `Breadcrumb`                                                                                                                             | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Buttons           | `Button`, `ButtonGroup`, `IconButton`, `CloseButton`, `DeleteButton`, `EditButton`, `SelectButton`, `TooltipIconButton`                  | Family                 | Mixed styled wrappers + prop context                 | Family                    | P2       | Internal consistency needs review                                      |
| Card              | `Card`                                                                                                                                   | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Carousel          | `Carousel`                                                                                                                               | Compound               | `createStyleContext` + custom parts                  | Compound                  | P2       | Mostly aligned                                                         |
| Checkbox          | `Checkbox`                                                                                                                               | Compound               | `createStyleContext` + `Object.assign`               | Compound                  | P1       | Normalize public shape                                                 |
| CheckboxCard      | `CheckboxCard`                                                                                                                           | Adapter                | Wrapper over Checkbox                                | Adapter or Compound       | P1       | Public API feels ad hoc                                                |
| Clipboard         | `Clipboard`                                                                                                                              | Compound               | `createStyleContext` + custom indicator              | Compound                  | P2       | Mostly aligned                                                         |
| Code              | `Code`                                                                                                                                   | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Collapsible       | `Collapsible`                                                                                                                            | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| ColorPicker       | `ColorPicker`, color-picker parts                                                                                                        | Hybrid                 | Compound internals + split exports                   | Compound                  | P1       | Unify export shape                                                     |
| Combobox          | `Combobox`                                                                                                                               | Compound               | `createStyleContext` + custom item logic             | Compound                  | P2       | Mostly aligned                                                         |
| ContextMenu       | `ContextMenu`                                                                                                                            | Adapter                | Menu-based wrapper                                   | Adapter                   | P3       | Intentional adapter                                                    |
| DataTable         | `DataTable`                                                                                                                              | Feature                | TanStack Table integration                           | Feature                   | P3       | Intentional feature component                                          |
| DatePicker        | `DatePicker`, `RangeDatePicker`, `DatePickerSelect`                                                                                      | Feature                | Ark composition + custom logic                       | Feature                   | P2       | Family naming should stay explicit                                     |
| DebugFontSwitcher | `DebugFontSwitcher`                                                                                                                      | Feature                | Dev utility wrapper                                  | Feature                   | P3       | Intentional utility                                                    |
| Dialog            | `Dialog`, `SubmitDialog`, `DeleteDialog`                                                                                                 | Compound               | `createStyleContext` + root provider                 | Compound                  | P3       | Already aligned                                                        |
| DisplayValue      | `DisplayValue`                                                                                                                           | Feature                | Generic value formatter                              | Feature                   | P3       | Intentional utility-like component                                     |
| Drawer            | `Drawer`                                                                                                                                 | Compound               | `createStyleContext` + root provider                 | Compound                  | P3       | Already aligned                                                        |
| Editable          | `Editable`                                                                                                                               | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| EditableText      | `EditableText`                                                                                                                           | Adapter                | Wrapper over Editable                                | Adapter or Feature        | P2       | Classify explicitly                                                    |
| EmptyState        | `EmptyState`                                                                                                                             | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Fieldset          | `Fieldset`                                                                                                                               | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| FileUpload        | `FileUpload`, `FormFileUpload`                                                                                                           | Feature                | Custom stateful composition                          | Feature                   | P2       | Explicit family exports are fine                                       |
| Form              | `Field`, `SubmitForm`                                                                                                                    | Feature                | Factory-style form helpers                           | Feature                   | P3       | Intentional feature API                                                |
| Heading           | `Heading`                                                                                                                                | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Highlight         | `SearchHighlight`, `useHighlight`                                                                                                        | Pass-through           | Re-export + wrapper                                  | Pass-through              | P3       | Intentional convenience layer                                          |
| HoverCard         | `HoverCard`                                                                                                                              | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Icon              | `Icon`                                                                                                                                   | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Image             | `Image`                                                                                                                                  | Feature                | Thin wrapper with display logic                      | Feature                   | P2       | Document as utility-style feature                                      |
| Input             | `Input`, `Textarea`, `InputGroup`, `PasswordInput`, `SearchInput`, `MultiLineInput`                                                      | Family                 | Mixed styled + custom wrappers                       | Family                    | P2       | Internal composition should be documented                              |
| Kbd               | `Kbd`                                                                                                                                    | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Layout            | `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Wrap`, `Divider`, `Separator` | Pass-through           | Direct `styled-system/jsx` re-export                 | Pass-through              | P3       | Intentional exception to wrapper rule                                  |
| Link              | `Link`                                                                                                                                   | Pass-through           | Thin wrapper                                         | Pass-through              | P3       | Intentional convenience export                                         |
| List              | `List`                                                                                                                                   | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Listbox           | `Listbox`                                                                                                                                | Compound               | Compound API + custom collection logic               | Compound                  | P2       | More advanced than documented pattern                                  |
| LoadingOverlay    | `LoadingOverlay`                                                                                                                         | Feature                | Utility wrapper                                      | Feature                   | P3       | Intentional utility                                                    |
| Logo              | `Logo`                                                                                                                                   | Feature                | SVG component                                        | Feature                   | P3       | Intentional asset component                                            |
| Menu              | `Menu`                                                                                                                                   | Compound               | `createStyleContext` + custom item logic             | Compound                  | P2       | Mostly aligned                                                         |
| NumberInput       | `NumberInput`                                                                                                                            | Compound               | `createStyleContext` + `Object.assign`               | Compound                  | P1       | Normalize public shape                                                 |
| Pagination        | `Pagination`                                                                                                                             | Compound               | `createStyleContext` + custom renderer               | Compound                  | P2       | Mostly aligned                                                         |
| PinInput          | `PinInput`                                                                                                                               | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Popover           | `Popover`                                                                                                                                | Compound               | `createStyleContext` + wrapper logic                 | Compound                  | P2       | Mostly aligned                                                         |
| Progress          | `Progress`                                                                                                                               | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Provider          | none                                                                                                                                     | Feature                | Placeholder                                          | Feature                   | P3       | Empty folder, verify intent                                            |
| Radio             | `Radio`, `RadioGroup`                                                                                                                    | Hybrid                 | Root alias + item wrapper                            | Compound                  | P1       | Normalize export naming                                                |
| RadioCard         | `RadioCard`                                                                                                                              | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| RatingGroup       | `RatingGroup`                                                                                                                            | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| ScrollArea        | `ScrollArea`                                                                                                                             | Compound               | `createStyleContext` + `Object.assign`               | Compound                  | P1       | Normalize public shape                                                 |
| SegmentGroup      | `SegmentGroup`                                                                                                                           | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Select            | `Select`, `TagSelect`, `SelectButton`                                                                                                    | Feature                | Custom React context + Listbox/Popover composition   | Feature                   | P2       | Intentional advanced feature, avoid forcing into simple compound model |
| Skeleton          | `Skeleton`, `SkeletonCircle`, `SkeletonText`                                                                                             | Family                 | Styled primitives + wrapper helpers                  | Family                    | P2       | Family rules should be documented                                      |
| Slider            | `Slider`                                                                                                                                 | Compound               | `createStyleContext` + wrapper logic                 | Compound                  | P2       | Mostly aligned                                                         |
| Span              | `Span`                                                                                                                                   | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Spinner           | `Spinner`                                                                                                                                | Primitive              | Styled wrapper                                       | Primitive                 | P3       | Already aligned                                                        |
| Splitter          | `Splitter`                                                                                                                               | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Stat              | `Stat`                                                                                                                                   | Compound               | `createStyleContext` + wrapper parts                 | Compound                  | P2       | Mostly aligned                                                         |
| Switch            | `Switch`                                                                                                                                 | Compound               | `createStyleContext` + wrapper export                | Compound                  | P1       | Normalize public shape                                                 |
| Table             | `Table`                                                                                                                                  | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Tabs              | `Tabs`                                                                                                                                   | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| TagsInput         | `TagsInput`                                                                                                                              | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| Text              | `Text`, related text helpers                                                                                                             | Primitive/Pass-through | Styled wrapper exports                               | Primitive or Pass-through | P3       | Low risk, document exact category                                      |
| Toast             | `Toaster`, `toaster`                                                                                                                     | Pass-through           | Direct re-export                                     | Pass-through              | P3       | Intentional convenience layer                                          |
| ToggleGroup       | `ToggleGroup`                                                                                                                            | Compound               | `createStyleContext`                                 | Compound                  | P3       | Already aligned                                                        |
| ToggleTip         | `ToggleTip`, `InfoTip`                                                                                                                   | Adapter                | Popover/Tooltip-style wrapper                        | Adapter or Feature        | P2       | Classification should be explicit                                      |
| Tooltip           | `Tooltip`                                                                                                                                | Hybrid                 | Root provider compound hidden behind function facade | Compound or Adapter       | P2       | Document or normalize facade pattern                                   |
| Tree              | `TreeView`, `TreeSelectList`, tree hooks and utilities                                                                                   | Feature                | Ark utility re-exports + custom helpers              | Feature                   | P2       | Intentional feature family                                             |
| VirtualScrollArea | `VirtualScrollArea`                                                                                                                      | Feature                | Generic utility wrapper                              | Feature                   | P3       | Intentional utility component                                          |
| utils             | internal helpers                                                                                                                         | Internal               | Shared internal helpers                              | Internal                  | P3       | Should stay out of curated public API if possible                      |

## Cross-Cutting Findings

### Public API inconsistencies

- The top-level barrel mixes wildcard re-exports and curated named exports.
- Some compounds are exposed as plain namespace objects, while others use `Object.assign` or wrapper facades.
- Some families leak exports across folder boundaries, such as Select re-exporting `SelectButton` from Buttons.

### Documentation mismatches

- Internal implementation regularly imports Ark UI and `styled-system/*` directly, even though the current instructions forbid that pattern broadly.
- The documented three-pattern model is too narrow for the actual package surface.

### Highest-value migration targets

1. Normalize compound export shape for Checkbox, NumberInput, ScrollArea, Switch, and Radio.
2. Clarify whether ApplyInput, ApplySelect, CheckboxCard, EditableText, ToggleTip, and Tooltip are adapters or features.
3. Decide whether Select remains a feature-family exception or should expose a more canonical compound facade.
4. Replace mixed top-level barrel strategy with a single explicit export policy.

## Recommended Standardization Order

1. Update docs and instructions to reflect the real taxonomy.
2. Define one top-level barrel policy.
3. Define one standard compound export policy.
4. Normalize P1 components.
5. Revisit adapter and feature exceptions only if the API still feels inconsistent after steps 1 through 4.

## Current Policy Direction

The preferred direction is now a **3-pattern model** for compounds.

| Pattern | Definition | Best fit |
| --- | --- | --- |
| Shell-collapsing compound | The top-level export hides repetitive outer shell while preserving JSX authoring for meaningful inner content | Overlays, floating UI, repeated layout shells |
| Control-wrapper compound | The top-level export is the standard control most consumers expect, while statics expose the internal parts | Checkbox-like and input-like controls |
| Pure compound namespace | The parts are the API; there is no simplified top-level wrapper | Structural and inherently compositional widgets |

Rule of thumb:

- If the repetition is mostly shell boilerplate, use shell-collapsing.
- If the repetition is mostly standard control plumbing, use control-wrapper.
- If composition is the point of the component, use pure namespace.

## Compound Classification Table

This table classifies the current UI compounds into the 3 preferred patterns.

| Component | 3-pattern classification | Why |
| --- | --- | --- |
| `Accordion` | Pure compound namespace | Item, trigger, and content composition are already the natural authoring model |
| `Actionbar` | Shell-collapsing compound | The repeated value is the floating action shell, not the inner action JSX |
| `Alert` | Shell-collapsing compound | The common case is a standard alert frame with title, description, icon, and close affordance |
| `Avatar` | Pure compound namespace | The compound surface is already small and explicit |
| `Breadcrumb` | Pure compound namespace | The breadcrumb structure is naturally authored through parts |
| `Card` | Pure compound namespace | Cards are layout primitives more than precomposed wrappers |
| `Carousel` | Pure compound namespace | Consumers often need explicit slot composition for controls and indicators |
| `Checkbox` | Control-wrapper compound | Most consumers want the default labeled checkbox, not manual hidden-input composition |
| `Clipboard` | Pure compound namespace | The copy interaction is usually embedded in custom layouts |
| `Collapsible` | Pure compound namespace | Trigger/content composition is already the natural API |
| `ColorPicker` | Shell-collapsing compound | The common value is the trigger + positioned picker shell with a default control layout |
| `Combobox` | Pure compound namespace | Search, items, and selection behavior make the part surface important |
| `Dialog` | Shell-collapsing compound | The repeated shell is the trigger + positioning + content frame, while body content should stay JSX |
| `Drawer` | Shell-collapsing compound | Same rationale as Dialog, with a predictable frame and body/footer shell |
| `Editable` | Pure compound namespace | Editing flows vary too much for one default wrapper |
| `EmptyState` | Pure compound namespace | The layout is often product-specific even if the slots are familiar |
| `Fieldset` | Pure compound namespace | Consumers usually compose field groups intentionally |
| `HoverCard` | Shell-collapsing compound | The repeated value is the floating hover shell, not the inner content markup |
| `List` | Pure compound namespace | There is little value in hiding the list anatomy behind a wrapper |
| `Listbox` | Pure compound namespace | Collection and item behavior are the real API |
| `Menu` | Shell-collapsing compound | The useful simplification is hiding trigger/positioner/content boilerplate while keeping items authored as JSX |
| `NumberInput` | Control-wrapper compound | Most consumers want the standard field + controls shell |
| `Pagination` | Pure compound namespace | Consumers often need explicit control over item layout and labels |
| `PinInput` | Pure compound namespace | The component is compact already, and the part model is still meaningful |
| `Popover` | Shell-collapsing compound | Trigger + portal + positioner + content is repetitive shell ceremony |
| `Progress` | Pure compound namespace | The part API is already minimal |
| `Radio` | Pure compound namespace | Group and item semantics are clearer when explicit |
| `RadioCard` | Pure compound namespace | Card-style radios are still authored intentionally through slots |
| `RatingGroup` | Pure compound namespace | The primitive API is already concise |
| `ScrollArea` | Shell-collapsing compound | Most consumers want a scroll container with default viewport and scrollbars |
| `SegmentGroup` | Pure compound namespace | Group/item composition is the real API |
| `Slider` | Pure compound namespace | Marks, labels, thumbs, and control over parts matter quickly |
| `Splitter` | Pure compound namespace | Pane composition is the core contract |
| `Stat` | Pure compound namespace | Layout and slot composition are part of the use case |
| `Switch` | Control-wrapper compound | Most consumers want a labeled toggle, not raw part composition |
| `Table` | Pure compound namespace | Tables are structural primitives, not wrapper shells |
| `Tabs` | Pure compound namespace | List, trigger, and content are already the natural API |
| `TagsInput` | Pure compound namespace | Collection and item behavior make the advanced surface important |
| `ToggleGroup` | Pure compound namespace | Group/item composition is the actual API |
| `Tooltip` | Shell-collapsing compound | The repeated value is trigger + positioning + content behavior, not the tooltip body markup |

### Outside the 3-pattern compound model

These exports should keep their own category rules rather than being forced into one of the three compound patterns.

| Bucket | Components |
| --- | --- |
| Family | `Buttons`, `Input`, `Skeleton` |
| Feature | `DataTable`, `DatePicker`, `DebugFontSwitcher`, `DisplayValue`, `FileUpload`, `Form`, `Image`, `LoadingOverlay`, `Logo`, `Provider`, `Select`, `Tree`, `VirtualScrollArea` |
| Adapter | `ApplyInput`, `ApplySelect`, `CheckboxCard`, `ContextMenu`, `EditableText`, `ToggleTip` |
| Pass-through | `Highlight`, `Layout`, `Link`, `Text`, `Toast` |
| Internal | `utils` |

## Naming Conventions Under The 3-pattern Model

### Shell-collapsing compounds

- The base export is the ergonomic shell-collapsing API.
- Statics such as `.Root`, `.Trigger`, `.Content`, `.Body`, and `.Footer` expose advanced composition.
- The simplified API should hide shell, not replace inner JSX with config objects.

Example direction:

- `Dialog` is the ergonomic API.
- `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Body`, and `Dialog.Footer` remain available for advanced composition.

### Control-wrapper compounds

- The base export is the common control consumers expect.
- Statics expose the internal pieces for advanced composition.

Example direction:

- `Checkbox` is the standard labeled checkbox.
- `Checkbox.Root`, `Checkbox.HiddenInput`, `Checkbox.Control`, `Checkbox.Indicator`, and `Checkbox.Label` remain available for advanced composition.

### Pure compound namespaces

- The base export is the parts namespace.
- There is no simplified top-level wrapper by default.

Example direction:

- `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, and `Tabs.Content` are the API.

### Semantic presets stay separate

Semantic presets and workflow-specific wrappers should remain separate named exports layered over one of the three patterns.

Examples:

- `DeleteDialog`
- `SubmitDialog`
- `InfoTip`
- `ApplySelect`
