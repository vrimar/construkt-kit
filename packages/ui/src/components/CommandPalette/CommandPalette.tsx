import { type CollectionItem, createListCollection } from "@ark-ui/react/collection";
import { Combobox as ArkCombobox } from "@ark-ui/react/combobox";
import { Dialog as ArkDialog, useDialogContext } from "@ark-ui/react/dialog";
import { ark } from "@ark-ui/react/factory";
import { CheckIcon, SearchIcon } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
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
import type { WithRef } from "../../types";
import { CloseButton } from "../Buttons";
import { moveCaretOnHomeEnd } from "../Combobox/inputKeys";
import { Dialog, type DialogRootProps } from "../Dialog";
import { SearchHighlight } from "../Highlight";
import { useItemSlotIds } from "../itemSlots";
import { Kbd } from "../Kbd";
import type { StyledRootProps } from "../rootProps";

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
  query: string;
  pages: readonly CommandPalettePage[];
  closePage: () => void;
  register: ItemRegistry["register"];
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

type ComboboxRootProps = StyledRootProps<ArkCombobox.RootBaseProps<CollectionItem>>;

const StyledRoot = withProvider(
  ArkCombobox.Root,
  "root",
) as ArkCombobox.RootComponent<ComboboxRootProps>;
const Label = withContext(ArkCombobox.Label, "label");
const Control = withContext(ArkCombobox.Control, "control");
const Token = withContext(ark.span, "token");
const StyledInput = withContext(ArkCombobox.Input, "input");
const StyledContent = withContext(ArkCombobox.Content, "content");
const ItemGroup = withContext(ArkCombobox.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkCombobox.ItemGroupLabel, "itemGroupLabel");
const ItemGroupCount = withContext(ark.span, "itemGroupCount");
const StyledItem = withContext(ArkCombobox.Item, "item");
const ItemIcon = withContext(ark.span, "itemIcon");
const ItemBody = withContext(ark.span, "itemBody");
const ItemText = withContext(ArkCombobox.ItemText, "itemText");
const ItemDescription = withContext(ark.span, "itemDescription");
const ItemMeta = withContext(ark.span, "itemMeta");
const ItemIndicator = withContext(ArkCombobox.ItemIndicator, "itemIndicator");
const Empty = withContext(ArkCombobox.Empty, "empty");

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

interface PaletteComboboxProps {
  label: string;
  navigation: Navigation;
  children?: ReactNode;
}

function PaletteCombobox({ label, navigation, children }: PaletteComboboxProps) {
  const dialog = useDialogContext();
  const { items, registry } = useItemRegistry();
  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => item.disabled,
      }),
    [items],
  );
  const checkedValues = useMemo(
    () => items.filter((item) => item.checked).map((item) => item.value),
    [items],
  );

  const highlightScope = JSON.stringify([navigation.query, navigation.pages.map((p) => p.value)]);
  const [picked, setPicked] = useState<{ scope: string; value: string | null }>({
    scope: highlightScope,
    value: null,
  });
  const pickedValue = picked.scope === highlightScope ? picked.value : null;
  const pickedItem = collection.find(pickedValue);
  const highlightedValue =
    pickedItem != null && !pickedItem.disabled ? pickedItem.value : collection.firstValue;

  const select = (value: string) => {
    const item = registry.get(value);
    if (item == null || item.disabled) return;
    const { label: itemLabel, opensPage, closeOnSelect, onSelect } = item.action.current;
    if (opensPage != null) {
      onSelect?.();
      navigation.openPage({ value: opensPage, label: itemLabel });
      return;
    }
    if (closeOnSelect) dialog.setOpen(false);
    onSelect?.();
  };

  const context: PaletteContextValue = {
    query: navigation.query,
    pages: navigation.pages,
    closePage: navigation.closePage,
    register: registry.register,
  };

  return (
    <PaletteContext.Provider value={context}>
      <StyledRoot
        collection={collection}
        open
        disableLayer
        allowCustomValue
        selectionBehavior="preserve"
        inputValue={navigation.query}
        onInputValueChange={({ inputValue, reason }) => {
          if (reason === "input-change") navigation.setQuery(inputValue);
        }}
        value={checkedValues}
        highlightedValue={highlightedValue}
        onHighlightChange={({ highlightedValue: value }) => {
          setPicked({ scope: highlightScope, value });
        }}
        onSelect={({ itemValue }) => select(itemValue)}
      >
        <Label>{[label, ...navigation.pages.map((page) => page.label)].join(" › ")}</Label>
        {children}
      </StyledRoot>
    </PaletteContext.Provider>
  );
}

export interface CommandPaletteRootProps extends Omit<
  DialogRootProps,
  "children" | "aria-label" | "role" | "size" | "placement" | "scrollBehavior" | "motionPreset"
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
  onEscapeKeyDown,
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
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event);
        if (event.defaultPrevented || pages.length === 0) return;
        event.preventDefault();
        navigation.closePage();
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
        <PaletteCombobox
          label={label}
          navigation={navigation}
        >
          {children}
        </PaletteCombobox>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function Input({
  ref,
  onKeyDown,
  ...props
}: WithRef<ComponentProps<typeof StyledInput>, HTMLInputElement>) {
  const { pages, closePage } = usePalette();

  return (
    <Control>
      {pages.length === 0 ? (
        <SearchIcon />
      ) : (
        pages.map((page, index) => <Token key={index}>{page.label}</Token>)
      )}
      <StyledInput
        ref={ref}
        {...props}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          moveCaretOnHomeEnd(event);
          const backOnePage =
            event.key === "Backspace" &&
            !isComposingEvent(event) &&
            event.currentTarget.value === "" &&
            pages.length > 0;
          if (event.defaultPrevented || !backOnePage) return;
          event.preventDefault();
          closePage();
        }}
      />
      <ArkDialog.CloseTrigger asChild>
        <CloseButton
          size="sm"
          hideFrom="md"
        />
      </ArkDialog.CloseTrigger>
    </Control>
  );
}

function List({ onMouseDown, ...props }: WithRef<ComponentProps<typeof StyledContent>>) {
  return (
    <StyledContent
      {...props}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Keeps focus in the search field when a row is clicked.
        event.preventDefault();
      }}
    />
  );
}

export interface CommandPaletteGroupProps extends ComponentProps<typeof ItemGroup> {
  label?: ReactNode;
  /** Shown at the end of the heading, such as the number of matches before a limit. */
  count?: ReactNode;
}

function Group({ label, count, children, ...props }: WithRef<CommandPaletteGroupProps>) {
  return (
    <ItemGroup {...props}>
      {(label != null || count != null) && (
        <ItemGroupLabel>
          {label}
          {count != null && <ItemGroupCount>{count}</ItemGroupCount>}
        </ItemGroupLabel>
      )}
      {children}
    </ItemGroup>
  );
}

export interface CommandPaletteItemProps extends Omit<
  ComponentProps<typeof StyledItem>,
  "item" | "persistFocus" | "children" | "onSelect"
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
  ...props
}: WithRef<CommandPaletteItemProps>) {
  const { query, register } = usePalette();
  const nodeRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(nodeRef, ref);
  const action = useLatestRef<ItemAction>({ label, opensPage, closeOnSelect, onSelect });

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
      ref={composedRef}
      aria-labelledby={props["aria-label"] === undefined ? textId : undefined}
      {...props}
      aria-describedby={describedBy}
      item={{ value, label, disabled }}
      persistFocus
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
        <ItemIndicator hidden={false}>
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
