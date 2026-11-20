import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import {
  type CSSProperties,
  type ComponentProps,
  type ElementType,
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type TreeViewVariantProps, treeView } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useStore } from "../../primitives/store";
import type { StyledRootProps } from "../rootProps";
import {
  type TreeCheckedState,
  TreeCollection,
  type TreeNodes,
  getCheckedState,
} from "./treeCollection";
import {
  type PressModifiers,
  TreeViewNode,
  type VisibleNode,
  selectIsRenaming,
  selectIsTabStop,
} from "./treeViewNode";
import { type TreeLazyLoadProps, useTreeLazyLoad } from "./useTreeLazyLoad";

const { withProvider, withContext } = createSlotRecipeContext(treeView);

/** What `onExpandedChange` passes along with the expanded values. */
export interface TreeExpandedChangeDetails<T> {
  expandedNodes: T[];
  focusedValue: string | null;
}

/** What `onSelectionChange` passes along with the selected values. */
export interface TreeSelectionChangeDetails<T> {
  selectedNodes: T[];
  focusedValue: string | null;
}

/** What `actionsRef` hands back: moves to a row by its value from outside the tree. */
export interface TreeViewActions {
  /** Scrolls the row of `value` into view, rendering it first in a `VirtualTree`, and focuses it. */
  focus: (value: string) => void;
  /** Scrolls the row of `value` into view, rendering it first in a `VirtualTree`, without focusing it. */
  scrollTo: (value: string) => void;
}

/** The renamed node's new label and where it sits. */
export interface TreeRenameDetails {
  label: string;
  indexPath: number[];
}

interface TreeViewRootOwnProps<T> extends TreeNodes<T>, TreeLazyLoadProps<T> {
  /** `multiple` lets Ctrl/⌘ and Shift clicks and Shift + arrows select several nodes. @default "single" */
  selectionMode?: "single" | "multiple" | undefined;
  selectedValue?: string[] | undefined;
  defaultSelectedValue?: string[] | undefined;
  onSelectionChange?:
    | ((selectedValue: string[], details: TreeSelectionChangeDetails<T>) => void)
    | undefined;
  expandedValue?: string[] | undefined;
  defaultExpandedValue?: string[] | undefined;
  onExpandedChange?:
    | ((expandedValue: string[], details: TreeExpandedChangeDetails<T>) => void)
    | undefined;
  /** The checked leaves; a branch reads as checked or mixed from them. */
  checkedValue?: string[] | undefined;
  defaultCheckedValue?: string[] | undefined;
  onCheckedChange?: ((checkedValue: string[]) => void) | undefined;
  /**
   * Rows carry a check state: each row is announced as checked, unchecked or mixed, Space toggles
   * it, and `NodeCheckbox` is its visual.
   */
  checkable?: boolean | undefined;
  /** Clicking a branch, or Enter on it, also toggles it. @default true */
  expandOnClick?: boolean | undefined;
  /** Typing moves focus to the next shown node whose label starts with the typed text. @default true */
  typeahead?: boolean | undefined;
  /** Lets F2 rename the focused node when it returns true. */
  canRename?: ((node: T, indexPath: number[]) => boolean) | undefined;
  /** Called when a rename is submitted, with the node's value and its new, trimmed label. */
  onRenameComplete?: ((value: string, details: TreeRenameDetails) => void) | undefined;
  /** Receives the tree's {@link TreeViewActions}, to focus or scroll to a row from outside it. */
  actionsRef?: Ref<TreeViewActions | null> | undefined;
}

export type TreeViewRootProps<T = unknown> = StyledRootProps<TreeViewRootOwnProps<T>> &
  TreeViewVariantProps &
  TreeViewRootOwnProps<T> & { ref?: Ref<HTMLDivElement> | undefined };

interface TreeContextValue {
  tree: TreeViewNode;
  collection: TreeCollection<unknown>;
  visibleNodes: readonly VisibleNode<unknown>[];
  visibleValues: ReadonlySet<string>;
  /** The first enabled shown node, which holds the tab stop until a shown node takes focus. */
  firstValue: string | null;
  expanded: ReadonlySet<string>;
  selected: ReadonlySet<string>;
  checkedValue: readonly string[];
  loading: ReadonlySet<string>;
  checkable: boolean;
  multiple: boolean;
  labelId: string | undefined;
  registerLabel: (rendered: boolean) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

export function useTreeContext(): TreeContextValue {
  const context = useContext(TreeContext);
  if (!context) throw new Error("TreeView parts must be rendered inside TreeView.Root.");
  return context;
}

export interface TreeNodeState<T = unknown> {
  node: T;
  indexPath: number[];
  value: string;
  id: string;
  depth: number;
  isBranch: boolean;
  disabled: boolean;
  expanded: boolean;
  selected: boolean;
  loading: boolean;
  /** Whether the row is the tree's tab stop. */
  tabStop: boolean;
  renaming: boolean;
  readonly checked: TreeCheckedState;
}

const NodeContext = createContext<TreeNodeState | null>(null);

export function useTreeNodeState<T = unknown>(): TreeNodeState<T> {
  const state = useContext(NodeContext);
  if (!state) throw new Error("TreeView node parts must be rendered inside TreeView.NodeProvider.");
  return state as TreeNodeState<T>;
}

const NO_VALUES: string[] = [];

type RootElementProps = Omit<TreeViewRootProps, keyof TreeViewVariantProps>;

function RootElement({
  ref,
  render,
  nodes,
  getNodeValue,
  getNodeLabel,
  getChildren,
  getChildrenCount,
  isNodeDisabled,
  selectionMode = "single",
  selectedValue,
  defaultSelectedValue = NO_VALUES,
  onSelectionChange,
  expandedValue,
  defaultExpandedValue = NO_VALUES,
  onExpandedChange,
  checkedValue,
  defaultCheckedValue = NO_VALUES,
  onCheckedChange,
  checkable = false,
  expandOnClick = true,
  typeahead = true,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  canRename,
  onRenameComplete,
  actionsRef,
  children,
  ...rest
}: RootElementProps) {
  const id = useId();
  const [tree] = useState(() => new TreeViewNode(`tree:${id}`));
  useImperativeHandle(
    actionsRef,
    () => ({
      focus: (value) => tree.focus(value),
      scrollTo: (value) => tree.scrollTo(value),
    }),
    [tree],
  );
  const rtl = useLocale().dir === "rtl";
  const [labelRendered, setLabelRendered] = useState(false);
  const multiple = selectionMode === "multiple";

  const collection = useMemo(
    () =>
      new TreeCollection(nodes, {
        getNodeValue,
        getNodeLabel,
        getChildren,
        getChildrenCount,
        isNodeDisabled,
      }),
    [nodes, getNodeValue, getNodeLabel, getChildren, getChildrenCount, isNodeDisabled],
  );

  const findNodes = (values: readonly string[]) =>
    values.flatMap((value) => collection.findNode(value) ?? []);

  const [expanded, setExpanded] = useControllableState({
    value: expandedValue,
    defaultValue: defaultExpandedValue,
    onChange: (next: string[]) =>
      onExpandedChange?.(next, {
        get expandedNodes() {
          return findNodes(next);
        },
        focusedValue: tree.focusedValue,
      }),
  });
  const [selected, setSelected] = useControllableState({
    value: selectedValue,
    defaultValue: defaultSelectedValue,
    onChange: (next: string[]) =>
      onSelectionChange?.(next, {
        get selectedNodes() {
          return findNodes(next);
        },
        focusedValue: tree.focusedValue,
      }),
  });
  const [checked, setChecked] = useControllableState({
    value: checkedValue,
    defaultValue: defaultCheckedValue,
    onChange: onCheckedChange,
  });

  const lazyLoad = useTreeLazyLoad({
    collection,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
    abortKey: "",
  });

  // A change the owner of a controlled value turns down still re-renders, so the tree re-reads it.
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const rerendering = (set: (next: string[]) => void) => (next: string[]) => {
    set(next);
    rerender();
  };

  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const visibleNodes = useMemo(() => {
    const shown: VisibleNode<unknown>[] = [];
    collection.visit({
      onEnter: (node, indexPath) => {
        const value = collection.getNodeValue(node);
        shown.push({ node, indexPath, value, disabled: collection.getNodeDisabled(node) });
        return expandedSet.has(value) ? undefined : "skip";
      },
    });
    return shown;
  }, [collection, expandedSet]);

  const visibleValues = useMemo(
    () => new Set(visibleNodes.map((entry) => entry.value)),
    [visibleNodes],
  );
  const firstValue = visibleNodes.find((entry) => !entry.disabled)?.value ?? null;

  useLayoutEffect(() => {
    tree.update({
      collection,
      visibleNodes,
      expandedValue: expanded,
      selectedValue: selected,
      checkedValue: checked,
      multiple,
      expandOnClick,
      typeahead,
      rtl,
      canRename,
      onExpandedChange: rerendering(setExpanded),
      onSelectionChange: rerendering(setSelected),
      onCheckedChange: rerendering(setChecked),
      needsLoad: lazyLoad.needsLoad,
      load: lazyLoad.start,
      onRenameComplete:
        onRenameComplete &&
        ((value, label, indexPath) => onRenameComplete(value, { label, indexPath })),
    });
  });

  useEffect(() => () => tree.dispose(), [tree]);

  const registerLabel = useCallback((rendered: boolean) => setLabelRendered(rendered), []);

  const context: TreeContextValue = {
    tree,
    collection,
    visibleNodes,
    visibleValues,
    firstValue,
    expanded: expandedSet,
    selected: selectedSet,
    checkedValue: checked,
    loading: lazyLoad.loadingValues,
    checkable,
    multiple,
    labelId: labelRendered ? `${tree.id}:label` : undefined,
    registerLabel,
  };

  return (
    <TreeContext value={context}>
      <renderable.div
        ref={ref}
        render={render}
        {...(rest as ComponentProps<"div">)}
      >
        {children}
      </renderable.div>
    </TreeContext>
  );
}

const StyledRoot = withProvider(RootElement as ElementType, "root");

const Root = StyledRoot as unknown as <T>(props: TreeViewRootProps<T>) => JSX.Element;

/** Gives the parts inside it the node they render. */
function NodeProvider<T>({
  node,
  indexPath,
  children,
}: {
  node: T;
  indexPath: number[];
  children?: ReactNode;
}) {
  const context = useTreeContext();
  const { tree, collection, firstValue, visibleValues } = context;
  const value = collection.getNodeValue(node);
  const tabStopArg = useMemo(
    () => ({ value, first: firstValue, visible: visibleValues }),
    [value, firstValue, visibleValues],
  );
  const tabStop = useStore(tree.store, selectIsTabStop, tabStopArg);
  const renaming = useStore(tree.store, selectIsRenaming, value);
  const isBranch = collection.isBranchNode(node);
  const { checkedValue } = context;

  const state = useMemo<TreeNodeState>(
    () => ({
      node,
      indexPath,
      value,
      id: tree.nodeId(value),
      depth: indexPath.length,
      isBranch,
      disabled: collection.getNodeDisabled(node),
      expanded: context.expanded.has(value),
      selected: context.selected.has(value),
      loading: context.loading.has(value),
      tabStop,
      renaming,
      get checked() {
        return getCheckedState(collection, node, checkedValue);
      },
    }),
    [
      node,
      indexPath,
      value,
      tree,
      isBranch,
      collection,
      context.expanded,
      context.selected,
      context.loading,
      tabStop,
      renaming,
      checkedValue,
    ],
  );

  return <NodeContext value={state}>{children}</NodeContext>;
}

const checkedAttrs = (checked: TreeCheckedState) =>
  checked === "indeterminate"
    ? { "data-indeterminate": "" }
    : checked
      ? { "data-checked": "" }
      : { "data-unchecked": "" };

export const ariaChecked = (checked: TreeCheckedState) =>
  checked === "indeterminate" ? "mixed" : checked ? "true" : "false";

const depthStyle = (depth: number): CSSProperties & { "--tree-depth": number } => ({
  "--tree-depth": depth,
});

const isAnchor = (element: Element) => element.matches("a[href]");

const isModified = (event: MouseEvent) => event.ctrlKey || event.altKey || event.metaKey;

const pressModifiers = (event: MouseEvent): PressModifiers => ({
  toggle: event.metaKey || event.ctrlKey,
  range: event.shiftKey,
});

function useRowRef(ref: Ref<HTMLElement> | undefined) {
  const { tree } = useTreeContext();
  const { value } = useTreeNodeState();
  const register = useCallback(
    (element: HTMLElement | null) => (element ? tree.registerRow(value, element) : undefined),
    [tree, value],
  );
  return useComposedRefs(ref, register);
}

function useSpaceToggle() {
  const { tree, checkable } = useTreeContext();
  const { value, isBranch, disabled } = useTreeNodeState();
  return (event: KeyboardEvent<HTMLElement>) => {
    if (!checkable || event.defaultPrevented || event.key !== " ") return;
    if (event.target !== event.currentTarget || disabled) return;
    event.preventDefault();
    tree.toggleChecked(value, isBranch);
  };
}

const StyledTree = withContext(renderable.div, "tree");

function Tree(props: ComponentProps<typeof StyledTree>) {
  const { tree, labelId, multiple } = useTreeContext();
  return (
    <StyledTree
      {...mergeProps<ComponentProps<typeof StyledTree>>(
        {
          id: `${tree.id}:tree`,
          role: "tree",
          "aria-label": "Tree View",
          "aria-labelledby": labelId,
          "aria-multiselectable": multiple || undefined,
          tabIndex: -1,
          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => tree.onTreeKeyDown(event),
        },
        props,
      )}
    />
  );
}

const StyledLabel = withContext(renderable.h3, "label");

function Label(props: ComponentProps<typeof StyledLabel>) {
  const { tree, registerLabel } = useTreeContext();
  useLayoutEffect(() => {
    registerLabel(true);
    return () => registerLabel(false);
  }, [registerLabel]);
  return (
    <StyledLabel
      id={`${tree.id}:label`}
      {...props}
    />
  );
}

const StyledBranch = withContext(renderable.div, "branch");

function Branch(props: ComponentProps<typeof StyledBranch>) {
  const { checkable } = useTreeContext();
  const state = useTreeNodeState();
  return (
    <StyledBranch
      {...mergeProps<ComponentProps<typeof StyledBranch>>(
        {
          role: "treeitem",
          "aria-level": state.depth,
          "aria-selected": state.disabled ? undefined : state.selected,
          "aria-expanded": state.expanded,
          "aria-disabled": state.disabled || undefined,
          "aria-busy": state.loading || undefined,
          "aria-checked": checkable ? ariaChecked(state.checked) : undefined,
          "data-value": state.value,
          "data-path": state.indexPath.join("/"),
          "data-depth": state.depth,
          "data-selected": dataAttr(state.selected),
          "data-expanded": dataAttr(state.expanded),
          "data-disabled": dataAttr(state.disabled),
          "data-loading": dataAttr(state.loading),
          style: depthStyle(state.depth),
        } as ComponentProps<typeof StyledBranch>,
        props,
      )}
    />
  );
}

const StyledBranchControl = withContext(renderable.div, "branchControl", {
  defaultProps: { "data-reveal-group": "" },
});

function BranchControl({ ref, ...props }: ComponentProps<typeof StyledBranchControl>) {
  const { tree } = useTreeContext();
  const state = useTreeNodeState();
  const rowRef = useRowRef(ref);
  const onSpace = useSpaceToggle();
  const { value, disabled, loading } = state;
  return (
    <StyledBranchControl
      {...mergeProps<ComponentProps<typeof StyledBranchControl>>(
        {
          id: state.id,
          role: "button",
          tabIndex: state.tabStop ? 0 : -1,
          "data-value": value,
          "data-path": state.indexPath.join("/"),
          "data-depth": state.depth,
          "data-expanded": dataAttr(state.expanded),
          "data-selected": dataAttr(state.selected),
          "data-disabled": dataAttr(disabled),
          "data-renaming": dataAttr(state.renaming),
          "data-loading": dataAttr(loading),
          "aria-busy": loading || undefined,
          onFocus: (event: FocusEvent<HTMLDivElement>) => {
            event.stopPropagation();
            tree.onRowFocus(value);
          },
          onClick: (event: MouseEvent<HTMLDivElement>) => {
            if (disabled || loading || event.button !== 0) return;
            if (isAnchor(event.currentTarget) && isModified(event)) return;
            tree.press(value, true, pressModifiers(event));
            event.stopPropagation();
          },
          onKeyDown: onSpace,
        } as ComponentProps<typeof StyledBranchControl>,
        props,
      )}
      ref={rowRef}
    />
  );
}

const StyledBranchTrigger = withContext(renderable.div, "branchTrigger");

function BranchTrigger(props: ComponentProps<typeof StyledBranchTrigger>) {
  const { tree } = useTreeContext();
  const { value, expanded, disabled, loading } = useTreeNodeState();
  return (
    <StyledBranchTrigger
      {...mergeProps<ComponentProps<typeof StyledBranchTrigger>>(
        {
          role: "button",
          "data-value": value,
          "data-expanded": dataAttr(expanded),
          "data-disabled": dataAttr(disabled),
          "data-loading": dataAttr(loading),
          onClick: (event: MouseEvent<HTMLDivElement>) => {
            if (disabled || loading) return;
            tree.toggleExpanded(value);
            event.stopPropagation();
          },
        } as ComponentProps<typeof StyledBranchTrigger>,
        props,
      )}
    />
  );
}

const StyledBranchIndicator = withContext(renderable.div, "branchIndicator");

function BranchIndicator({
  children = <ChevronRightIcon />,
  ...props
}: ComponentProps<typeof StyledBranchIndicator>) {
  const { expanded, disabled, selected, loading } = useTreeNodeState();
  return (
    <StyledBranchIndicator
      aria-hidden
      data-expanded={dataAttr(expanded)}
      data-disabled={dataAttr(disabled)}
      data-selected={dataAttr(selected)}
      data-loading={dataAttr(loading)}
      {...props}
    >
      {children}
    </StyledBranchIndicator>
  );
}

const StyledBranchText = withContext(renderable.span, "branchText");

function BranchText(props: ComponentProps<typeof StyledBranchText>) {
  const { expanded, disabled, loading } = useTreeNodeState();
  return (
    <StyledBranchText
      data-expanded={dataAttr(expanded)}
      data-disabled={dataAttr(disabled)}
      data-loading={dataAttr(loading)}
      {...props}
    />
  );
}

const StyledBranchContent = withContext(renderable.div, "branchContent");

function BranchContent(props: ComponentProps<typeof StyledBranchContent>) {
  const { value, expanded, depth, indexPath } = useTreeNodeState();
  return (
    <StyledBranchContent
      role="group"
      hidden={!expanded}
      data-value={value}
      data-path={indexPath.join("/")}
      data-depth={depth}
      data-expanded={dataAttr(expanded)}
      {...props}
    />
  );
}

const StyledBranchIndentGuide = withContext(renderable.div, "branchIndentGuide");

function BranchIndentGuide(props: ComponentProps<typeof StyledBranchIndentGuide>) {
  const { depth } = useTreeNodeState();
  return (
    <StyledBranchIndentGuide
      data-depth={depth}
      {...props}
    />
  );
}

const StyledItem = withContext(renderable.div, "item", {
  defaultProps: { "data-reveal-group": "" },
});

function Item({ ref, ...props }: ComponentProps<typeof StyledItem>) {
  const { tree, checkable } = useTreeContext();
  const state = useTreeNodeState();
  const rowRef = useRowRef(ref);
  const onSpace = useSpaceToggle();
  const { value, disabled, selected } = state;
  return (
    <StyledItem
      {...mergeProps<ComponentProps<typeof StyledItem>>(
        {
          id: state.id,
          role: "treeitem",
          tabIndex: state.tabStop ? 0 : -1,
          "aria-level": state.depth,
          "aria-current": selected ? "true" : undefined,
          "aria-selected": disabled ? undefined : selected,
          "aria-disabled": disabled || undefined,
          "aria-checked": checkable ? ariaChecked(state.checked) : undefined,
          "data-value": value,
          "data-path": state.indexPath.join("/"),
          "data-depth": state.depth,
          "data-selected": dataAttr(selected),
          "data-disabled": dataAttr(disabled),
          "data-renaming": dataAttr(state.renaming),
          style: depthStyle(state.depth),
          onFocus: (event: FocusEvent<HTMLDivElement>) => {
            event.stopPropagation();
            tree.onRowFocus(value);
          },
          onClick: (event: MouseEvent<HTMLDivElement>) => {
            if (disabled || event.button !== 0) return;
            const anchor = isAnchor(event.currentTarget);
            if (anchor && isModified(event)) return;
            tree.press(value, false, pressModifiers(event));
            event.stopPropagation();
            if (!anchor) event.preventDefault();
          },
          onKeyDown: onSpace,
        } as ComponentProps<typeof StyledItem>,
        props,
      )}
      ref={rowRef}
    />
  );
}

const StyledItemIndicator = withContext(renderable.div, "itemIndicator");

function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  const { selected, disabled } = useTreeNodeState();
  return (
    <StyledItemIndicator
      aria-hidden
      hidden={!selected}
      data-selected={dataAttr(selected)}
      data-disabled={dataAttr(disabled)}
      {...props}
    />
  );
}

const StyledItemText = withContext(renderable.span, "itemText");

function ItemText(props: ComponentProps<typeof StyledItemText>) {
  const { selected, disabled } = useTreeNodeState();
  return (
    <StyledItemText
      data-selected={dataAttr(selected)}
      data-disabled={dataAttr(disabled)}
      {...props}
    />
  );
}

interface NodeCheckboxIndicatorProps {
  /** Shown while the node is checked. */
  children?: ReactNode;
  /** Shown while the branch is mixed. */
  indeterminate?: ReactNode;
  /** Shown while the node is unchecked. */
  fallback?: ReactNode;
}

function NodeCheckboxIndicator({ children, indeterminate, fallback }: NodeCheckboxIndicatorProps) {
  const { checked } = useTreeNodeState();
  if (checked === "indeterminate" && indeterminate) return indeterminate;
  if (checked === true && children) return children;
  return fallback;
}

const checkIcon = (checked: TreeCheckedState) =>
  checked === "indeterminate" ? <MinusIcon /> : checked ? <CheckIcon /> : null;

// Decorative: a focusable `role="checkbox"` nested in the row fails `nested-interactive`.
const StyledNodeCheckbox = withContext(renderable.span, "nodeCheckbox");

type NodeCheckboxProps = ComponentProps<typeof StyledNodeCheckbox> & {
  /** The state to show in place of the root's `checkedValue`. */
  checked?: TreeCheckedState | undefined;
};

function NodeCheckbox({ checked: checkedProp, children, ...props }: NodeCheckboxProps) {
  const { tree } = useTreeContext();
  const state = useTreeNodeState();
  const checked = checkedProp ?? state.checked;
  const own: Record<string, unknown> = {
    "aria-hidden": true,
    ...checkedAttrs(checked),
    "data-disabled": dataAttr(state.disabled),
    onClick: (event: MouseEvent<HTMLSpanElement>) => {
      if (event.defaultPrevented || state.disabled || event.button !== 0) return;
      event.stopPropagation();
      tree.toggleChecked(state.value, state.isBranch);
      tree.focusRow(state.value);
    },
  };
  return (
    <StyledNodeCheckbox
      {...mergeProps<ComponentProps<typeof StyledNodeCheckbox>>(
        own as ComponentProps<typeof StyledNodeCheckbox>,
        props,
      )}
    >
      {children ?? checkIcon(checked)}
    </StyledNodeCheckbox>
  );
}

const StyledNodeRenameInput = withContext(renderable.input, "nodeRenameInput");

function NodeRenameInput({ ref, ...props }: ComponentProps<typeof StyledNodeRenameInput>) {
  const { tree, collection } = useTreeContext();
  const { node, value, renaming } = useTreeNodeState();
  const label = collection.stringifyNode(node);
  const start = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input || !renaming) return;
      input.value = label;
      input.focus();
      input.select();
    },
    [renaming, label],
  );
  const composedRef = useComposedRefs(ref, start);
  return (
    <StyledNodeRenameInput
      {...mergeProps<ComponentProps<typeof StyledNodeRenameInput>>(
        {
          id: `${tree.id}:rename:${value}`,
          type: "text",
          "aria-label": "Rename tree item",
          hidden: !renaming,
          onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
            if (isComposingEvent(event)) return;
            if (event.key === "Escape") {
              event.preventDefault();
              tree.cancelRename();
            } else if (event.key === "Enter") {
              event.preventDefault();
              tree.submitRename(event.currentTarget.value, true);
            }
            event.stopPropagation();
          },
          onBlur: (event: FocusEvent<HTMLInputElement>) =>
            tree.submitRename(event.currentTarget.value, false),
          onClick: (event: MouseEvent<HTMLInputElement>) => event.stopPropagation(),
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

const DropIndicator = withContext(renderable.div, "dropIndicator");
const StyledNodeActions = withContext(renderable.div, "nodeActions");
const BranchCount = withContext(renderable.span, "branchCount");
export const FlatIndentGuide = withContext(renderable.div, "branchIndentGuide");
export const FlatBranchControl = withContext(renderable.div, "branchControl");
export const FlatBranchIndicator = withContext(renderable.span, "branchIndicator");
export const FlatNodeCheckbox = withContext(renderable.span, "nodeCheckbox");
export const TreeRowContent = withContext(renderable.div, "nodeContent");

function NodeActions({ onClick, onKeyDown, ...props }: ComponentProps<typeof StyledNodeActions>) {
  return (
    <StyledNodeActions
      {...props}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
    />
  );
}

export type { TreeViewVariantProps };

/**
 * A tree of `nodes`, read through `getNodeValue`, `getNodeLabel` and `getChildren`. Recurse over
 * the nodes inside `NodeProvider` (needs `node` + `indexPath`) to render `Branch`/`Item` parts, or
 * render `VirtualTree` inside `Tree` for a tree whose rows mount only in view.
 *
 * `DropIndicator` is a low-level styled slot for drag-and-drop that expects a
 * manually set `data-instruction` and inset — most consumers should use the
 * higher-level `TreeDropIndicator` (from `./dnd`) instead.
 *
 * `NodeCheckbox` is decorative: set `checkable` on the root so the row itself carries the check
 * state and Space toggles it.
 *
 * `NodeActions` holds a row's trailing controls and keeps their clicks and keys from the row; the
 * root's `actionsVisibility="hover"` reveals them with the row. `BranchCount` is a muted count at
 * the end of a branch row.
 */
export const TreeView = {
  Root,
  Tree,
  Label,
  Branch,
  BranchControl,
  BranchTrigger,
  BranchIndicator,
  BranchText,
  BranchCount,
  BranchContent,
  BranchIndentGuide,
  Item,
  ItemIndicator,
  ItemText,
  NodeProvider,
  NodeCheckbox,
  NodeCheckboxIndicator,
  NodeRenameInput,
  NodeActions,
  DropIndicator,
};
