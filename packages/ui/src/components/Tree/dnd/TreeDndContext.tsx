import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import type { ReactNode, RefObject } from "react";
import { createContext, useContext, useEffect, useId, useMemo } from "react";

import { useAnnouncer } from "../../../hooks/useAnnouncer";
import { useLatestRef } from "../../../hooks/useLatestRef";
import { useDragAutoScroll } from "../../dnd";
import type { TreeCollection } from "../treeCollection";
import { useTreeContext } from "../TreeView";
import {
  dropInto,
  getKeyboardDropTarget,
  type TreeDropInstruction,
  type TreeKeyboardMove,
} from "./treeDropLogic";

/** Data key stamping each draggable/drop-target with its owning tree's instance id. */
export const TREE_DND_INSTANCE_KEY = "construkt-tree-dnd-instance";

type DragData = Record<string | symbol, unknown>;

export function readTreeDragSource(data: DragData, instanceId: string): string | null {
  return data[TREE_DND_INSTANCE_KEY] === instanceId && typeof data.value === "string"
    ? data.value
    : null;
}

export function readTreeDropInstruction(data: DragData): TreeDropInstruction | null {
  const instruction = extractInstruction(data);
  if (!instruction || instruction.type === "instruction-blocked") return null;
  if (instruction.type === "reparent") {
    return { type: "reparent", desiredLevel: instruction.desiredLevel };
  }
  return { type: instruction.type, currentLevel: instruction.currentLevel };
}

export interface TreeCanDropDetails {
  /** The node the drag or keyboard move started on. */
  sourceValue: string;
  targetValue: string;
  instruction: TreeDropInstruction;
}

export interface TreeDropDetails<T = unknown> {
  /** Every dragged node (one, unless multi-drag). */
  sourceValues: string[];
  targetValue: string;
  instruction: TreeDropInstruction;
  /** The nodes after the drop. */
  nextNodes: T[];
  /** The nodes before the drop. */
  previousNodes: T[];
}

export interface TreeDndContextValue<T = unknown> {
  instanceId: string;
  /** Whether drag-and-drop is currently off. */
  disabled: boolean;
  /** Latest collection, read at drag time so registration needn't re-run on every change. */
  collectionRef: Readonly<RefObject<TreeCollection<T>>>;
  blockReparent: boolean;
  /** ms before a hovered collapsed branch auto-expands during a drag, or `false` to disable. */
  autoExpandDelay: number | false;
  /** Stable predicate — resolves the node lazily so an inline `isNodeDraggable` never churns. */
  canDrag: (value: string) => boolean;
  /** Stable predicate vetoing a specific drop (target + relationship rules). */
  canDrop: (details: TreeCanDropDetails) => boolean;
  isBranchLoaded: (value: string) => boolean;
  /** Values moved when dragging `value` (multi-drag selection). Defaults to `[value]`. */
  getDragValues: (value: string) => string[];
  /** Extra data merged into the drag payload (e.g. for cross-surface drops). */
  getExtraDragData: (value: string) => Record<string | symbol, unknown>;
  /** Custom drag-preview content for `value`, or `null` to use the default compact chip. */
  renderDragPreview: (value: string) => ReactNode;
  /**
   * Keyboard reorder of `value` and the rest of its drag values. Runs the same
   * `canDrag`/`canDrop`/`blockReparent` validation and `onNodesChange`/`onDrop`/announce
   * pipeline as pointer drops. Returns the committed drop, or `null` when nothing moved.
   */
  moveByKeyboard: (value: string, move: TreeKeyboardMove) => TreeDropDetails<T> | null;
}

const TreeDndContext = createContext<TreeDndContextValue | null>(null);

export function useTreeDndContext(): TreeDndContextValue | null {
  return useContext(TreeDndContext);
}

export interface TreeViewDndProviderProps<T> {
  /** Called with the reordered nodes after any reorder (optimistic; pointer or keyboard). */
  onNodesChange: (nodes: T[]) => void;
  /**
   * Side-effect after a reorder (persist, analytics). If it rejects, the optimistic
   * `onNodesChange` is reverted to the previous nodes (unless a newer reorder has since been
   * committed). Fires for both pointer drops and keyboard moves.
   */
  onDrop?: (details: TreeDropDetails<T>) => void | Promise<void>;
  /** Fired when any drag in this tree starts. */
  onDragStart?: (details: { sourceValue: string; sourceValues: string[] }) => void;
  /** Fired when any drag in this tree ends (dropped or cancelled). */
  onDragEnd?: () => void;
  /** Veto a specific reorder; also suppresses the drop indicator for rejected targets. */
  canDrop?: (details: TreeCanDropDetails) => boolean;
  /**
   * Values to move when dragging or keyboard-moving `value` (e.g. the current multi-selection).
   * Values missing from the tree are skipped. Default `[value]`.
   */
  getDragValues?: (value: string) => string[];
  /** Extra data attached to the drag payload for cross-surface drops. */
  getExtraDragData?: (value: string) => Record<string | symbol, unknown>;
  /** Render custom drag-preview content (portaled). Return nothing to use the default compact chip. */
  renderDragPreview?: (value: string) => ReactNode;
  /** Build the screen-reader announcement for a completed reorder. */
  getDropAnnouncement?: (details: TreeDropDetails<T>) => string;
  /**
   * Turns drag-and-drop off. Toggle this rather than unmounting the provider, which would
   * remount the tree. @default false
   */
  disabled?: boolean;
  /** Disable outdent (reparent) drops and keyboard outdent. @default false */
  blockReparent?: boolean;
  /**
   * Whether a branch with a non-zero `childrenCount` but no `children` has loaded them, so drops
   * may nest into it. @default whether the branch is expanded
   */
  isBranchLoaded?: (value: string) => boolean;
  /**
   * ms a drag must hover a collapsed branch before it auto-expands, or `false` to disable
   * hover auto-expand. @default 500
   */
  autoExpandDelay?: number | false;
  /**
   * Whether a node may be dragged (pointer) or keyboard-moved. Disabled nodes never are.
   * @default all enabled nodes
   */
  isNodeDraggable?: (node: T) => boolean;
  /** Scroll container to auto-scroll (vertically) near its edges during a drag. */
  scrollElement?: Element | null;
  /** Auto-scroll speed. @default "standard" */
  autoScrollSpeed?: "standard" | "fast";
  children: ReactNode;
}

const DEFAULT_AUTO_EXPAND_DELAY_MS = 500;

const defaultDropAnnouncement = (
  { sourceValues }: TreeDropDetails<unknown>,
  collection: TreeCollection<unknown>,
): string => {
  if (sourceValues.length > 1) return `Moved ${sourceValues.length} items.`;
  return `Moved ${collection.stringify(sourceValues[0]) ?? "item"}.`;
};

/**
 * Drag-and-drop and keyboard reordering for the enclosing `TreeView.Root`, whose `nodes` it
 * reorders.
 */
export function TreeViewDndProvider<T>({
  onNodesChange,
  onDrop,
  onDragStart,
  onDragEnd,
  canDrop,
  getDragValues,
  getExtraDragData,
  renderDragPreview,
  getDropAnnouncement,
  disabled = false,
  blockReparent = false,
  isBranchLoaded,
  autoExpandDelay = DEFAULT_AUTO_EXPAND_DELAY_MS,
  isNodeDraggable,
  scrollElement,
  autoScrollSpeed = "standard",
  children,
}: TreeViewDndProviderProps<T>) {
  const instanceId = useId();
  const { announce, liveRegion } = useAnnouncer();

  const { tree, collection: treeCollection, expanded } = useTreeContext();
  const expandedRef = useLatestRef(expanded);
  const collectionRef = useLatestRef(treeCollection as TreeCollection<T>);
  const handlers = useLatestRef({
    onNodesChange,
    onDrop,
    onDragStart,
    onDragEnd,
    canDrop,
    getDragValues,
    getExtraDragData,
    renderDragPreview,
    getDropAnnouncement,
    isNodeDraggable,
    isBranchLoaded,
  });

  const [contextValue, commitDrop] = useMemo(() => {
    const canDrag = (value: string) => {
      const collection = collectionRef.current;
      const node = collection.findNode(value);
      if (!node) return true;
      if (collection.getNodeDisabled(node)) return false;
      return handlers.current.isNodeDraggable?.(node) ?? true;
    };

    const allowsDrop = (details: TreeCanDropDetails) => handlers.current.canDrop?.(details) ?? true;

    const branchLoaded = (value: string) =>
      handlers.current.isBranchLoaded?.(value) ?? expandedRef.current.has(value);

    const dragValuesOf = (value: string) =>
      (handlers.current.getDragValues?.(value) ?? [value]).filter(canDrag);

    const commit = (details: TreeCanDropDetails): TreeDropDetails<T> | null => {
      if (!allowsDrop(details)) return null;
      const { targetValue, instruction } = details;
      const sourceValues = dragValuesOf(details.sourceValue);
      const previous = collectionRef.current;
      const next = dropInto(previous, {
        sourceValues,
        targetValue,
        instruction,
        isBranchLoaded: branchLoaded,
      });
      if (!next) return null;

      const nextNodes = next.nodes as T[];
      const previousNodes = previous.nodes as T[];
      const drop = { sourceValues, targetValue, instruction, nextNodes, previousNodes };
      const h = handlers.current;
      h.onNodesChange(nextNodes);
      if (instruction.type === "make-child") tree.expand([targetValue]);
      announce(
        h.getDropAnnouncement?.(drop) ??
          defaultDropAnnouncement(drop, next as TreeCollection<unknown>),
      );
      Promise.resolve()
        .then(() => h.onDrop?.(drop))
        .catch(() => {
          // Revert only if no later move has committed since.
          if (collectionRef.current.nodes === nextNodes) {
            h.onNodesChange(previousNodes);
          }
        });
      return drop;
    };

    const context: TreeDndContextValue<T> = {
      instanceId,
      disabled,
      collectionRef,
      blockReparent,
      autoExpandDelay,
      canDrag,
      canDrop: allowsDrop,
      isBranchLoaded: branchLoaded,
      getDragValues: dragValuesOf,
      getExtraDragData: (value) => handlers.current.getExtraDragData?.(value) ?? {},
      renderDragPreview: (value) => handlers.current.renderDragPreview?.(value) ?? null,
      moveByKeyboard: (value, move) => {
        if (!canDrag(value)) return null;
        if (move === "outdent" && blockReparent) return null;
        const target = getKeyboardDropTarget(collectionRef.current, value, move);
        return target && commit({ sourceValue: value, ...target });
      },
    };

    return [context, commit] as const;
  }, [
    instanceId,
    disabled,
    collectionRef,
    expandedRef,
    tree,
    blockReparent,
    autoExpandDelay,
    handlers,
    announce,
  ]);

  useEffect(() => {
    if (disabled) return;
    return monitorForElements({
      canMonitor: ({ source }) => readTreeDragSource(source.data, instanceId) !== null,
      onDragStart: ({ source }) => {
        const sourceValue = readTreeDragSource(source.data, instanceId);
        if (sourceValue === null) return;
        handlers.current.onDragStart?.({
          sourceValue,
          sourceValues: contextValue.getDragValues(sourceValue),
        });
      },
      onDrop: ({ source, location }) => {
        handlers.current.onDragEnd?.();
        const target = location.current.dropTargets[0];
        if (!target) return;
        const sourceValue = readTreeDragSource(source.data, instanceId);
        const instruction = readTreeDropInstruction(target.data);
        if (sourceValue === null || !instruction) return;
        commitDrop({ sourceValue, targetValue: String(target.data.value), instruction });
      },
    });
  }, [instanceId, disabled, contextValue, commitDrop, handlers]);

  useDragAutoScroll({
    element: scrollElement,
    axis: "vertical",
    disabled,
    maxScrollSpeed: autoScrollSpeed,
    canScroll: ({ source }) => readTreeDragSource(source.data, instanceId) !== null,
  });

  return (
    <TreeDndContext.Provider value={contextValue as TreeDndContextValue}>
      {children}
      {liveRegion}
    </TreeDndContext.Provider>
  );
}
