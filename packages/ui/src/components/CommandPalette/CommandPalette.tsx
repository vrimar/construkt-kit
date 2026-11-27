import { sameItems } from "@construkt-kit/utils";
import { SearchIcon } from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { commandPalette } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type RenderedParts,
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { CompositeList } from "../../primitives/composite";
import type { OpenChangeReason } from "../../primitives/layer";
import {
  Announcer,
  type ListEntry,
  ListboxNode,
  useListboxActiveDescendant,
  useListboxContentRef,
  useListboxInputRef,
} from "../../primitives/listbox";
import { dataAttr, renderable } from "../../primitives/render";
import { CloseButton } from "../Buttons";
import { Dialog, type DialogRootOwnProps } from "../Dialog";
import { useModalContext } from "../dialogParts";
import { SearchHighlight } from "../Highlight";
import { useItemSlotIds } from "../itemSlots";
import { Kbd } from "../Kbd";
import { createListboxParts } from "../listboxParts";
import { createPartContext } from "../partContext";

/** A sub-page on the palette's stack. `label` is its token in the search field. */
export interface CommandPalettePage {
  value: string;
  label: string;
}

interface ItemAction {
  label: string;
  opensPage: string | undefined;
  closeOnSelect: boolean;
  onSelect: (() => void) | undefined;
}

interface RegisteredItem {
  value: string;
  label: string;
  disabled: boolean;
  checked: boolean;
  action: Readonly<RefObject<ItemAction>>;
}

interface ItemRegistry {
  get: (value: string) => RegisteredItem | undefined;
  register: (element: HTMLElement, item: RegisteredItem) => () => void;
}

interface PaletteContextValue {
  node: ListboxNode;
  ids: { label: string; input: string; list: string };
  rendered: RenderedParts<"input" | "list">;
  reportRendered: ReportRendered<"input" | "list">;
  query: string;
  setQuery: (query: string) => void;
  pages: readonly CommandPalettePage[];
  closePage: () => void;
  close: (reason: OpenChangeReason, event?: Event) => void;
  empty: boolean;
  register: ItemRegistry["register"];
}

const [PaletteContext, usePalette] = createPartContext<PaletteContextValue>(
  "<CommandPalette.Root>",
  "CommandPalette parts",
);

const { withProvider, withContext } = createSlotRecipeContext(commandPalette);

const StyledRoot = withProvider(renderable.div, "root");
const Label = withContext(renderable.label, "label");
const Control = withContext(renderable.div, "control");
const Token = withContext(renderable.span, "token");
const StyledInput = withContext(renderable.input, "input");
const StyledContent = withContext(renderable.div, "content");
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const ItemGroupLabel = withContext(renderable.div, "itemGroupLabel");
const ItemGroupCount = withContext(renderable.span, "itemGroupCount");
const ItemIcon = withContext(renderable.span, "itemIcon");
const ItemBody = withContext(renderable.span, "itemBody");
const ItemDescription = withContext(renderable.span, "itemDescription");
const ItemMeta = withContext(renderable.span, "itemMeta");
const StyledEmpty = withContext(renderable.div, "empty");

const StyledItem = withContext(renderable.div, "item");
const StyledItemText = withContext(renderable.span, "itemText");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator");

const parts = createListboxParts(
  {
    Item: StyledItem,
    ItemText: StyledItemText,
    ItemIndicator: StyledItemIndicator,
    ItemGroup: StyledItemGroup,
    ItemGroupLabel,
  },
  "command-palette-group",
);

const sameItem = (a: RegisteredItem, b: RegisteredItem) =>
  a.value === b.value &&
  a.label === b.label &&
  a.disabled === b.disabled &&
  a.checked === b.checked;

type ItemsUpdate = (current: readonly RegisteredItem[]) => readonly RegisteredItem[];

function createItemRegistry(update: (sync: ItemsUpdate) => void): ItemRegistry {
  const list = new CompositeList();
  const records = new Map<string, RegisteredItem>();
  let sorted: readonly RegisteredItem[] | null = null;
  const sync: ItemsUpdate = (current) => {
    sorted ??= list.items().flatMap(({ value }) => records.get(value) ?? []);
    return sameItems(current, sorted, sameItem) ? current : sorted;
  };
  const changed = () => {
    sorted = null;
    update(sync);
  };

  return {
    get: (value) => records.get(value),
    register(element, item) {
      records.set(item.value, item);
      const unregister = list.register(element, item.value, item.label);
      changed();
      return () => {
        unregister();
        if (records.get(item.value) !== item) return;
        records.delete(item.value);
        changed();
      };
    },
  };
}

function useItemRegistry() {
  const [items, setItems] = useState<readonly RegisteredItem[]>([]);
  const [registry] = useState(() => createItemRegistry(setItems));

  return { items, registry };
}

interface Navigation {
  query: string;
  setQuery: (query: string) => void;
  pages: readonly CommandPalettePage[];
  openPage: (page: CommandPalettePage) => void;
  closePage: () => void;
}

interface PaletteListProps {
  label: string;
  navigation: Navigation;
  children?: ReactNode;
}

function PaletteList({ label, navigation, children }: PaletteListProps) {
  const { requestOpenChange } = useModalContext();
  const close = (reason: OpenChangeReason, event?: Event) =>
    requestOpenChange(false, reason, event);
  const id = useId();
  const [node] = useState(() => new ListboxNode(`command-palette:${id}`, null));
  const { items, registry } = useItemRegistry();
  const [rendered, reportRendered] = useRenderedParts<"input" | "list">();
  const entries = useMemo<ListEntry[]>(
    () => items.map(({ value, label: text, disabled }) => ({ value, label: text, disabled })),
    [items],
  );

  const select = (value: string) => {
    const item = registry.get(value);
    if (item == null || item.disabled) return;
    const { label: itemLabel, opensPage, closeOnSelect, onSelect } = item.action.current;
    if (opensPage != null) {
      onSelect?.();
      navigation.openPage({ value: opensPage, label: itemLabel });
      return;
    }
    if (closeOnSelect) close("item-press");
    onSelect?.();
  };

  useLayoutEffect(() => {
    node.update({
      entries,
      disabled: false,
      loopFocus: true,
      typeahead: false,
      alwaysShowHighlight: true,
      autoHighlight: true,
      scrollToIndex: undefined,
      onPick: (value) => select(value),
      onNavigate: undefined,
      onSelectAll: undefined,
      onHighlightChange: undefined,
      highlightControlled: false,
    });
  });

  const context: PaletteContextValue = {
    node,
    ids: {
      label: `${node.id}:label`,
      input: `${node.id}:input`,
      list: `${node.id}:content`,
    },
    rendered,
    reportRendered,
    query: navigation.query,
    setQuery: navigation.setQuery,
    pages: navigation.pages,
    closePage: navigation.closePage,
    close,
    empty: items.length === 0,
    register: registry.register,
  };

  return (
    <PaletteContext.Provider value={context}>
      <StyledRoot>
        <Label
          id={context.ids.label}
          htmlFor={rendered.input}
        >
          {[label, ...navigation.pages.map((page) => page.label)].join(" › ")}
        </Label>
        {children}
        <Announcer
          node={node}
          entries={entries}
          inputValue={navigation.query}
          loading={false}
          isSelected={(value) => registry.get(value)?.checked === true}
        />
      </StyledRoot>
    </PaletteContext.Provider>
  );
}

export interface CommandPaletteRootProps extends Omit<
  DialogRootOwnProps,
  "children" | "role" | "size" | "placement" | "scrollBehavior" | "motionPreset"
> {
  children?: ReactNode;
  /** Names the dialog and its search field. */
  label?: string;
  /** The search text. Filter, group and limit the rendered items from it. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Sub-pages opened from the root page, outermost first. Render the last page's items. */
  pages?: CommandPalettePage[];
  defaultPages?: CommandPalettePage[];
  onPagesChange?: (pages: CommandPalettePage[]) => void;
}

const NO_PAGES: CommandPalettePage[] = [];

const samePages = (a: readonly CommandPalettePage[], b: readonly CommandPalettePage[]) =>
  sameItems(a, b, (x, y) => x.value === y.value && x.label === y.label);

function Root({
  label = "Command palette",
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  pages: pagesProp,
  defaultPages = NO_PAGES,
  onPagesChange,
  onOpenChange,
  onExitComplete,
  children,
  ...dialogProps
}: CommandPaletteRootProps) {
  const [query, setQuery, resetQuery] = useControllableState({
    value: queryProp,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
  });
  const [pages, changePages, resetPages] = useControllableState({
    value: pagesProp,
    defaultValue: defaultPages,
    onChange: onPagesChange,
    isEqual: samePages,
  });
  const setPages = (next: CommandPalettePage[]) => {
    changePages(next);
    if (query !== "") setQuery("");
  };
  const navigation: Navigation = {
    query,
    setQuery,
    pages,
    openPage: (page) => setPages([...pages, page]),
    closePage: () => setPages(pages.slice(0, -1)),
  };

  return (
    <Dialog.Root
      size="xl"
      placement="top"
      scrollBehavior="inside"
      aria-label={label}
      {...dialogProps}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key" && pages.length > 0) {
          details.cancel();
          navigation.closePage();
          return;
        }
        onOpenChange?.(next, details);
      }}
      onExitComplete={() => {
        resetQuery();
        resetPages();
        onExitComplete?.();
      }}
    >
      <Dialog.Content
        maxW={{ md: "2xl" }}
        py={{ md: "0" }}
        overflow="hidden"
      >
        <PaletteList
          label={label}
          navigation={navigation}
        >
          {children}
        </PaletteList>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function Input({ ref, id, onKeyDown, onChange, ...props }: ComponentProps<typeof StyledInput>) {
  const context = usePalette();
  const { node, pages, closePage } = context;
  const inputId = useReportRendered(context.reportRendered, "input", id ?? context.ids.input);
  const activeDescendant = useListboxActiveDescendant(node);
  const composedRef = useComposedRefs(ref, useListboxInputRef(node));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isComposingEvent(event)) return;
    const backOnePage =
      event.key === "Backspace" && event.currentTarget.value === "" && pages.length > 0;
    if (backOnePage) {
      event.preventDefault();
      closePage();
      return;
    }
    if (event.ctrlKey || (event.shiftKey && event.key !== "Enter")) return;
    node.onInputKeyDown(event);
  };

  return (
    <Control>
      {pages.length === 0 ? (
        <SearchIcon />
      ) : (
        pages.map((page, index) => <Token key={index}>{page.label}</Token>)
      )}
      <StyledInput
        id={inputId}
        type="text"
        role="combobox"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-autocomplete="list"
        aria-controls={context.rendered.list}
        aria-expanded
        aria-activedescendant={activeDescendant}
        value={context.query}
        {...props}
        ref={composedRef}
        onChange={(event) => {
          onChange?.(event);
          node.setSuggesting(true);
          context.setQuery(event.currentTarget.value);
        }}
        onKeyDown={handleKeyDown}
      />
      <CloseButton
        size="sm"
        hideFrom="md"
        onClick={(event) => context.close("close-press", event.nativeEvent)}
      />
    </Control>
  );
}

function List({ ref, id, onMouseDown, ...props }: ComponentProps<typeof StyledContent>) {
  const context = usePalette();
  const composedRef = useComposedRefs(ref, useListboxContentRef(context.node));
  const listId = useReportRendered(context.reportRendered, "list", id ?? context.ids.list);
  return (
    <StyledContent
      id={listId}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={context.ids.label}
      data-empty={dataAttr(context.empty)}
      {...props}
      ref={composedRef}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Keeps focus in the search field when a row is clicked.
        event.preventDefault();
      }}
    />
  );
}

function Empty(props: ComponentProps<typeof StyledEmpty>) {
  if (!usePalette().empty) return null;
  return (
    <StyledEmpty
      {...props}
      role="presentation"
    />
  );
}

export interface CommandPaletteGroupProps extends ComponentProps<typeof StyledItemGroup> {
  label?: ReactNode;
  /** Shown at the end of the heading, such as the number of matches before a limit. */
  count?: ReactNode;
}

function Group({ label, count, children, ...props }: CommandPaletteGroupProps) {
  return (
    <parts.ItemGroup {...props}>
      {(label != null || count != null) && (
        <parts.ItemGroupLabel>
          {label}
          {count != null && <ItemGroupCount>{count}</ItemGroupCount>}
        </parts.ItemGroupLabel>
      )}
      {children}
    </parts.ItemGroup>
  );
}

export interface CommandPaletteItemProps extends Omit<
  ComponentProps<typeof StyledItem>,
  "children" | "onSelect"
> {
  /** Identifies the item among the items rendered with it. */
  value: string;
  /** The row's text. The query's words are highlighted in it. */
  label: string;
  /** Words to highlight in `label` in place of the query's, each only as a whole word. */
  highlight?: string;
  icon?: ReactNode;
  /** Second line under the label. */
  description?: ReactNode;
  /** Arrow keys skip the item and picking it does nothing. */
  disabled?: boolean;
  /** Second line shown in place of `description` while the item is disabled. */
  disabledReason?: ReactNode;
  /** Muted text or a count at the end of the row. */
  meta?: ReactNode;
  /** Keyboard shortcut shown at the end of the row. */
  shortcut?: string;
  /** Marks the item as the current choice. `false` keeps the check's space on the other choices. */
  checked?: boolean;
  /** Picking the item opens this sub-page, its token reading `label`, instead of closing. */
  opensPage?: string;
  /** Runs when the item is picked with Enter or a click. */
  onSelect?: () => void;
  /** Whether picking the item closes the palette. Defaults to `true`. */
  closeOnSelect?: boolean;
}

function Item({
  ref,
  value,
  label,
  highlight,
  icon,
  description,
  disabled = false,
  disabledReason,
  meta,
  shortcut,
  checked,
  opensPage,
  onSelect,
  closeOnSelect = true,
  onPointerMove,
  onClick,
  ...props
}: CommandPaletteItemProps) {
  const { node, query, register } = usePalette();
  const elementRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(elementRef, ref);
  const action = useLatestRef<ItemAction>({ label, opensPage, closeOnSelect, onSelect });

  // No deps: registering on every commit keeps keyboard order in step with keyed reorders.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    return register(element, { value, label, disabled, checked: checked === true, action });
  });

  const textId = useId();
  const secondLine = disabled && disabledReason != null ? disabledReason : description;
  const slots = useItemSlotIds({ description: secondLine, hint: meta }, props["aria-describedby"]);
  const { hintId: shortcutId, describedBy } = useItemSlotIds({ hint: shortcut }, slots.describedBy);

  return (
    <parts.Item
      node={node}
      value={value}
      selected={checked === true}
      disabled={disabled}
      tabIndex={-1}
      aria-labelledby={props["aria-label"] === undefined ? textId : undefined}
      {...props}
      aria-describedby={describedBy}
      ref={composedRef}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (!disabled && node.highlighted !== value) node.hover(value);
      }}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        node.onItemClick(value, event);
      }}
    >
      {icon != null && <ItemIcon>{icon}</ItemIcon>}
      <ItemBody>
        <parts.ItemText id={textId}>
          <SearchHighlight
            text={label}
            query={highlight ?? query}
            wholeWords={highlight !== undefined}
          />
        </parts.ItemText>
        {slots.descriptionId && (
          <ItemDescription
            id={slots.descriptionId}
            aria-hidden
          >
            {secondLine}
          </ItemDescription>
        )}
      </ItemBody>
      {slots.hintId && (
        <ItemMeta
          id={slots.hintId}
          aria-hidden
        >
          {meta}
        </ItemMeta>
      )}
      {shortcutId && (
        <Kbd
          id={shortcutId}
          aria-hidden
          size="sm"
          colorPalette="neutral"
        >
          {shortcut}
        </Kbd>
      )}
      {checked != null && <parts.ItemIndicator />}
    </parts.Item>
  );
}

export const CommandPalette = {
  Root,
  Input,
  List,
  Group,
  Item,
  Empty,
};
