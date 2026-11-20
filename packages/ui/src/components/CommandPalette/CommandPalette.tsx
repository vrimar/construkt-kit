import { CheckIcon, SearchIcon } from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  type OpenChangeDetails,
  type OpenChangeReason,
  createOpenChangeDetails,
} from "../../primitives/layer";
import { renderable } from "../../primitives/render";
import { useStore } from "../../primitives/store";
import { CloseButton } from "../Buttons";
import { Announcer } from "../Combobox/Announcer";
import { Dialog, type DialogRootOwnProps } from "../Dialog";
import { SearchHighlight } from "../Highlight";
import { useItemSlotIds } from "../itemSlots";
import { Kbd } from "../Kbd";
import {
  type ListEntry,
  ListboxNode,
  selectHighlighted,
  selectIsHighlighted,
} from "../Listbox/listboxNode";

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
  node: HTMLElement | null;
  action: Readonly<RefObject<ItemAction>>;
}

interface ItemRegistry {
  get: (value: string) => RegisteredItem | undefined;
  register: (item: RegisteredItem) => () => void;
}

interface PaletteContextValue {
  node: ListboxNode;
  ids: { label: string; input: string; list: string };
  query: string;
  setQuery: (query: string) => void;
  pages: readonly CommandPalettePage[];
  closePage: () => void;
  close: (reason: OpenChangeReason, event?: Event) => void;
  empty: boolean;
  register: ItemRegistry["register"];
  pick: (value: string, event: Event) => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

function usePalette() {
  const context = useContext(PaletteContext);
  if (context == null) {
    throw new Error("CommandPalette parts must be rendered inside CommandPalette.Root");
  }
  return context;
}

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
const StyledItem = withContext(renderable.div, "item");
const ItemIcon = withContext(renderable.span, "itemIcon");
const ItemBody = withContext(renderable.span, "itemBody");
const ItemText = withContext(renderable.span, "itemText");
const ItemDescription = withContext(renderable.span, "itemDescription");
const ItemMeta = withContext(renderable.span, "itemMeta");
const ItemIndicator = withContext(renderable.div, "itemIndicator");
const StyledEmpty = withContext(renderable.div, "empty");

const byDocumentOrder = (a: RegisteredItem, b: RegisteredItem) => {
  if (a.node == null || b.node == null || a.node === b.node) return 0;
  return a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
};

const isSameList = (current: readonly RegisteredItem[], next: readonly RegisteredItem[]) =>
  current.length === next.length &&
  current.every(
    (item, index) =>
      item.value === next[index].value &&
      item.label === next[index].label &&
      item.disabled === next[index].disabled &&
      item.checked === next[index].checked,
  );

type ItemsUpdate = (current: readonly RegisteredItem[]) => readonly RegisteredItem[];

function createItemRegistry(update: (sync: ItemsUpdate) => void): ItemRegistry {
  const entries = new Map<string, RegisteredItem>();
  let sorted: readonly RegisteredItem[] | null = null;
  const sync: ItemsUpdate = (current) => {
    sorted ??= [...entries.values()].sort(byDocumentOrder);
    return isSameList(current, sorted) ? current : sorted;
  };
  const changed = () => {
    sorted = null;
    update(sync);
  };

  return {
    get: (value) => entries.get(value),
    register(item) {
      entries.set(item.value, item);
      changed();
      return () => {
        if (entries.get(item.value) !== item) return;
        entries.delete(item.value);
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
  close: (reason: OpenChangeReason, event?: Event) => void;
  children?: ReactNode;
}

function PaletteList({ label, navigation, close, children }: PaletteListProps) {
  const id = useId();
  const [node] = useState(() => new ListboxNode(`command-palette:${id}`, null));
  const { items, registry } = useItemRegistry();
  const entries = useMemo<ListEntry[]>(
    () => items.map(({ value, label: text, disabled }) => ({ value, label: text, disabled })),
    [items],
  );

  const highlightScope = JSON.stringify([navigation.query, navigation.pages.map((p) => p.value)]);
  const [picked, setPicked] = useState<{ scope: string; value: string | null }>({
    scope: highlightScope,
    value: null,
  });
  const pickedValue = picked.scope === highlightScope ? picked.value : null;
  const pickedItem = items.find((item) => item.value === pickedValue);
  const highlightedValue =
    pickedItem != null && !pickedItem.disabled
      ? pickedItem.value
      : (items.find((item) => !item.disabled)?.value ?? null);

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
      scrollToIndex: undefined,
      onPick: (value) => select(value),
      onNavigate: undefined,
      onSelectAll: undefined,
      onHighlightChange: (value) => setPicked({ scope: highlightScope, value }),
      highlightControlled: true,
    });
  });

  useLayoutEffect(() => {
    node.syncHighlight(highlightedValue);
  }, [node, highlightedValue]);

  useEffect(() => {
    if (highlightedValue != null) node.scrollTo(highlightedValue);
  }, [node, highlightedValue, entries]);

  const context: PaletteContextValue = {
    node,
    ids: {
      label: `${node.id}:label`,
      input: `${node.id}:input`,
      list: `${node.id}:content`,
    },
    query: navigation.query,
    setQuery: navigation.setQuery,
    pages: navigation.pages,
    closePage: navigation.closePage,
    close,
    empty: items.length === 0,
    register: registry.register,
    pick: (value, event) => node.pick(value, event),
  };

  return (
    <PaletteContext.Provider value={context}>
      <StyledRoot>
        <Label
          id={context.ids.label}
          htmlFor={context.ids.input}
        >
          {[label, ...navigation.pages.map((page) => page.label)].join(" › ")}
        </Label>
        {children}
        <Announcer
          node={node}
          entries={entries}
          inputValue={navigation.query}
          loading={false}
          suggesting
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

function Root({
  label = "Command palette",
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  pages: pagesProp,
  defaultPages = NO_PAGES,
  onPagesChange,
  open: openProp,
  defaultOpen = false,
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
  });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen });

  const changeOpen = (next: boolean, details: OpenChangeDetails) => {
    onOpenChange?.(next, details);
    if (!details.canceled) setOpen(next);
  };

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
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key" && pages.length > 0) {
          details.cancel();
          navigation.closePage();
          return;
        }
        changeOpen(next, details);
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
          close={(reason, event) => changeOpen(false, createOpenChangeDetails(reason, event))}
        >
          {children}
        </PaletteList>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function Input({ ref, onKeyDown, onChange, ...props }: ComponentProps<typeof StyledInput>) {
  const context = usePalette();
  const { node, pages, closePage } = context;
  const highlighted = useStore(node.store, selectHighlighted);
  const setInput = useCallback(
    (element: HTMLElement | null) => {
      node.setInput(element);
      return () => node.setInput(null);
    },
    [node],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, setInput);

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
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      node.move(event.key === "ArrowDown" ? "next" : "prev");
      return;
    }
    if (event.key !== "Enter" || node.highlighted == null) return;
    event.preventDefault();
    const item = node.elementOf(node.highlighted);
    if (item?.matches("a[href]")) queueMicrotask(() => item.click());
    else context.pick(node.highlighted, event.nativeEvent);
  };

  return (
    <Control>
      {pages.length === 0 ? (
        <SearchIcon />
      ) : (
        pages.map((page, index) => <Token key={index}>{page.label}</Token>)
      )}
      <StyledInput
        id={context.ids.input}
        type="text"
        role="combobox"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-autocomplete="list"
        aria-controls={context.ids.list}
        aria-expanded
        aria-activedescendant={highlighted == null ? undefined : node.itemId(highlighted)}
        value={context.query}
        {...props}
        ref={composedRef}
        onChange={(event) => {
          onChange?.(event);
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

function List({ ref, onMouseDown, ...props }: ComponentProps<typeof StyledContent>) {
  const context = usePalette();
  const setContent = useCallback(
    (element: HTMLElement | null) => {
      context.node.setContent(element);
      return () => context.node.setContent(null);
    },
    [context.node],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, setContent);
  return (
    <StyledContent
      id={context.ids.list}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={context.ids.label}
      data-empty={context.empty ? "" : undefined}
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

function Group({ id, label, count, children, ...props }: CommandPaletteGroupProps) {
  const generated = useId();
  const groupId = id ?? `command-palette-group:${generated}`;
  const labelId = `${groupId}:label`;
  const labelled = label != null || count != null;
  return (
    <StyledItemGroup
      id={groupId}
      role="group"
      aria-labelledby={labelled ? labelId : undefined}
      {...props}
    >
      {labelled && (
        <ItemGroupLabel
          id={labelId}
          role="presentation"
        >
          {label}
          {count != null && <ItemGroupCount>{count}</ItemGroupCount>}
        </ItemGroupLabel>
      )}
      {children}
    </StyledItemGroup>
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
  const context = usePalette();
  const { node, query, register } = context;
  const nodeRef = useRef<HTMLDivElement>(null);
  const registerElement = useCallback(
    (element: HTMLElement | null) => (element ? node.registerItem(value, element) : undefined),
    [node, value],
  );
  const elementRef = useComposedRefs(nodeRef, registerElement);
  const composedRef = useComposedRefs(elementRef, ref);
  const action = useLatestRef<ItemAction>({ label, opensPage, closeOnSelect, onSelect });
  const highlighted = useStore(node.store, selectIsHighlighted, value);

  // No deps: registering on every commit keeps keyboard order in step with keyed reorders.
  useLayoutEffect(() =>
    register({
      value,
      label,
      disabled,
      checked: checked === true,
      node: nodeRef.current,
      action,
    }),
  );

  const textId = useId();
  const secondLine = disabled && disabledReason != null ? disabledReason : description;
  const slots = useItemSlotIds({ description: secondLine, hint: meta }, props["aria-describedby"]);
  const { hintId: shortcutId, describedBy } = useItemSlotIds({ hint: shortcut }, slots.describedBy);

  return (
    <StyledItem
      id={node.itemId(value)}
      role="option"
      tabIndex={-1}
      data-value={value}
      aria-selected={checked === true}
      aria-disabled={disabled || undefined}
      data-selected={checked ? "" : undefined}
      data-highlighted={highlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-labelledby={props["aria-label"] === undefined ? textId : undefined}
      {...props}
      aria-describedby={describedBy}
      ref={composedRef}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (!disabled && !highlighted) node.highlight(value);
      }}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled || event.button !== 0) return;
        context.pick(value, event.nativeEvent);
      }}
    >
      {icon != null && <ItemIcon>{icon}</ItemIcon>}
      <ItemBody>
        <ItemText id={textId}>
          <SearchHighlight
            text={label}
            query={query}
          />
        </ItemText>
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
      {checked != null && (
        <ItemIndicator
          aria-hidden
          {...(checked ? { "data-checked": "" } : { "data-unchecked": "" })}
        >
          <CheckIcon />
        </ItemIndicator>
      )}
    </StyledItem>
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
