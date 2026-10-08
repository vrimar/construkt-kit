import { type TreeCollection, type TreeNode, useTreeViewContext } from "@ark-ui/react/tree-view";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import type { ReactNode, RefObject } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";

import { VisuallyHidden } from "#styled-system/jsx";

import { useLatestRef } from "../../../hooks/useLatestRef";
import {
  applyTreeDrop,
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

export interface TreeDropDetails<T extends TreeNode = TreeNode> {
  /** Every dragged node (one, unless multi-drag). */
  sourceValues: string[];
  targetValue: string;
  instruction: TreeDropInstruction;
  nextCollection: TreeCollection<T>;
  previousCollection: TreeCollection<T>;
}

export interface TreeDndContextValue<T extends TreeNode = TreeNode> {
  instanceId: string;
  /** Whether drag-and-drop is currently active. */
  enabled: boolean;
  /** Latest collection, read at drag time so registration needn't re-run on every change. */
  collectionRef: Readonly<RefObject<TreeCollection<T>>>;
  blockReparent: boolean;
  /** ms before a hovered collapsed branch auto-expands during a drag, or `false` to disable. */
  autoExpandDelay: number | false;
  /** Stable predicate — resolves the node lazily so an inline `isNodeDraggable` never churns. */
  canDrag: (value: string) => boolean;
  /** Stable predicate vetoing a specific drop (target + relationship rules). */
  canDrop: (details: TreeCanDropDetails) => boolean;
  /** Values moved when dragging `value` (multi-drag selection). Defaults to `[value]`. */
  getDragValues: (value: string) => string[];
  /** Extra data merged into the drag payload (e.g. for cross-surface drops). */
  getExtraDragData: (value: string) => Record<string | symbol, unknown>;
  /** Custom drag-preview content for `value`, or `null` to use the default compact chip. */
  renderDragPreview: (value: string) => ReactNode;
  /**
   * Keyboard reorder of `value` and the rest of its drag values. Runs the same
   * `canDrag`/`canDrop`/`blockReparent` validation and `onCollectionChange`/`onDrop`/announce
   * pipeline as pointer drops. Returns the committed drop, or `null` when nothing moved.
   */
  moveByKeyboard: (value: string, move: TreeKeyboardMove) => TreeDropDetails<T> | null;
}

const TreeDndContext = createContext<TreeDndContextValue | null>(null);

export function useTreeDndContext(): TreeDndContextValue | null {
  return useContext(TreeDndContext);
}

export interface TreeViewDndProviderProps<T extends TreeNode> {
  /** Called with the reordered collection after any reorder (optimistic; pointer or keyboard). */
  onCollectionChange: (collection: TreeCollection<T>) => void;
  /**
   * Side-effect after a reorder (persist, analytics). If it rejects, the optimistic
   * `onCollectionChange` is reverted to the previous collection (unless a newer reorder has
   * since been committed). Fires for both pointer drops and keyboard moves.
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
   * Values missing from the collection are skipped. Default `[value]`.
   */
  getDragValues?: (value: string) => string[];
  /** Extra data attached to the drag payload for cross-surface drops. */
  getExtraDragData?: (value: string) => Record<string | symbol, unknown>;
  /** Render custom drag-preview content (portaled). Return nothing to use the default compact chip. */
  renderDragPreview?: (value: string) => ReactNode;
  /** Build the screen-reader announcement for a completed reorder. */
  getDropAnnouncement?: (details: TreeDropDetails<T>) => string;
  /**
   * Whether drag-and-drop is active. Kept mounted while disabled (rather than unmounting the
   * provider) so toggling it never remounts the tree. @default true
   */
  enabled?: boolean;
  /** Disable outdent (reparent) drops and keyboard outdent. @default false */
  blockReparent?: boolean;
  /**
   * ms a drag must hover a collapsed branch before it auto-expands, or `false` to disable
   * hover auto-expand. @default 500
   */
  autoExpandDelay?: number | false;
  /** Whether a node may be dragged (pointer) or keyboard-moved. @default all nodes */
  isNodeDraggable?: (node: T) => boolean;
  /** Scroll container to auto-scroll (vertically) near its edges during a drag. */
  scrollElement?: Element | null;
  /** Auto-scroll speed. @default "standard" */
  autoScrollSpeed?: "standard" | "fast";
  children: ReactNode;
}

const DEFAULT_AUTO_EXPAND_DELAY_MS = 500;

const defaultDropAnnouncement = <T extends TreeNode>({
  sourceValues,
  nextCollection,
}: TreeDropDetails<T>): string => {
  if (sourceValues.length > 1) return `Moved ${sourceValues.length} items.`;
  return `Moved ${nextCollection.stringify(sourceValues[0]) ?? "item"}.`;
};

/**
 * Drag-and-drop and keyboard reordering for the enclosing `TreeView.Root`/`RootProvider`,
 * whose `collection` it reorders.
 */
export function TreeViewDndProvider<T extends TreeNode>({
  onCollectionChange,
  onDrop,
  onDragStart,
  onDragEnd,
  canDrop,
  getDragValues,
  getExtraDragData,
  renderDragPreview,
  getDropAnnouncement,
  enabled = true,
  blockReparent = false,
  autoExpandDelay = DEFAULT_AUTO_EXPAND_DELAY_MS,
  isNodeDraggable,
  scrollElement,
  autoScrollSpeed = "standard",
  children,
}: TreeViewDndProviderProps<T>) {
  const instanceId = useId();
  const [announcement, setAnnouncement] = useState("");
  const announceToggle = useRef(false);

  const collectionRef = useLatestRef<TreeCollection<T>>(useTreeViewContext().collection);
  const handlers = useLatestRef({
    onCollectionChange,
    onDrop,
    onDragStart,
    onDragEnd,
    canDrop,
    getDragValues,
    getExtraDragData,
    renderDragPreview,
    getDropAnnouncement,
    isNodeDraggable,
    autoScrollSpeed,
  });

  const [contextValue, commitDrop] = useMemo(() => {
    // A toggled zero-width space makes screen readers re-announce identical messages.
    const announce = (message: string) => {
      announceToggle.current = !announceToggle.current;
      setAnnouncement(announceToggle.current ? message : `${message}\u200b`);
    };

    const canDrag = (value: string) => {
      const fn = handlers.current.isNodeDraggable;
      if (!fn) return true;
      const node = collectionRef.current.findNode(value);
      return node ? fn(node) : true;
    };

    const allowsDrop = (details: TreeCanDropDetails) => handlers.current.canDrop?.(details) ?? true;

    const dragValuesOf = (value: string) => handlers.current.getDragValues?.(value) ?? [value];

    const commit = (details: TreeCanDropDetails): TreeDropDetails<T> | null => {
      if (!allowsDrop(details)) return null;
      const { targetValue, instruction } = details;
      const sourceValues = dragValuesOf(details.sourceValue);
      const previousCollection = collectionRef.current;
      const nextCollection = applyTreeDrop(previousCollection, {
        sourceValues,
        targetValue,
        instruction,
      });
      if (!nextCollection) return null;

      const drop = { sourceValues, targetValue, instruction, nextCollection, previousCollection };
      const h = handlers.current;
      h.onCollectionChange(nextCollection);
      announce((h.getDropAnnouncement ?? defaultDropAnnouncement)(drop));
      Promise.resolve()
        .then(() => h.onDrop?.(drop))
        .catch(() => {
          // Revert only if no later move has committed since.
          if (collectionRef.current === nextCollection) {
            h.onCollectionChange(previousCollection);
          }
        });
      return drop;
    };

    const context: TreeDndContextValue<T> = {
      instanceId,
      enabled,
      collectionRef,
      blockReparent,
      autoExpandDelay,
      canDrag,
      canDrop: allowsDrop,
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
  }, [instanceId, enabled, collectionRef, blockReparent, autoExpandDelay, handlers]);

  useEffect(() => {
    if (!enabled) return;
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
  }, [instanceId, enabled, contextValue, commitDrop, handlers]);

  // Edge auto-scroll; re-binds when the scroll element mounts/changes, constrained to vertical.
  useEffect(() => {
    if (!enabled || !scrollElement) return;
    return autoScrollForElements({
      element: scrollElement,
      getAllowedAxis: () => "vertical",
      getConfiguration: () => ({ maxScrollSpeed: handlers.current.autoScrollSpeed }),
    });
  }, [enabled, scrollElement, handlers]);

  return (
    <TreeDndContext.Provider value={contextValue as TreeDndContextValue}>
      {children}
      <VisuallyHidden
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {announcement}
      </VisuallyHidden>
    </TreeDndContext.Provider>
  );
}
