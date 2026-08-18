import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import type { CSSProperties, MutableRefObject, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  applyTreeDrop,
  moveNodeByKeyboard,
  type TreeDropInstruction,
  type TreeKeyboardMove,
} from "./treeDropLogic";

/** Data key stamping each draggable/drop-target with its owning tree's instance id. */
export const TREE_DND_INSTANCE_KEY = "construkt-tree-dnd-instance";

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
  collectionRef: MutableRefObject<TreeCollection<T>>;
  /** Optional px override for hitbox indent math; the hook prefers the rendered `--tree-indent`. */
  indentPerLevel?: number;
  blockReparent: boolean;
  /** ms before a hovered collapsed branch auto-expands during a drag, or `false` to disable. */
  autoExpandDelay: number | false;
  /** Stable predicate — resolves the node lazily so an inline `isNodeDraggable` never churns. */
  canDrag: (value: string) => boolean;
  /** Stable predicate vetoing a specific drop (target + relationship rules). */
  canDrop: (details: {
    sourceValue: string;
    targetValue: string;
    instruction: TreeDropInstruction;
  }) => boolean;
  /** Values moved when dragging `value` (multi-drag selection). Defaults to `[value]`. */
  getDragValues: (value: string) => string[];
  /** Extra data merged into the drag payload (e.g. for cross-surface drops). */
  getExtraDragData: (value: string) => Record<string | symbol, unknown>;
  /** Custom drag-preview content for `value`, or `null` to use the default compact chip. */
  renderDragPreview: (value: string) => ReactNode;
  /** Announce a message to assistive tech via the tree's live region. */
  announce: (message: string) => void;
  /**
   * Keyboard reorder of `value`. Runs the same `canDrag`/`canDrop`/`blockReparent` validation and
   * `onCollectionChange`/`onDrop`/announce pipeline as pointer drops. Returns whether it moved.
   */
  moveByKeyboard: (value: string, move: TreeKeyboardMove) => boolean;
}

const TreeDndContext = createContext<TreeDndContextValue | null>(null);

export function useTreeDndContext(): TreeDndContextValue | null {
  return useContext(TreeDndContext);
}

export interface TreeViewDndProviderProps<T extends TreeNode> {
  /** The tree collection. Reordering returns a new collection via `onCollectionChange`. */
  collection: TreeCollection<T>;
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
  canDrop?: (details: {
    sourceValue: string;
    targetValue: string;
    instruction: TreeDropInstruction;
  }) => boolean;
  /** Values to move when dragging `value` (e.g. the current multi-selection). Default `[value]`. */
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
  /** Px override for hitbox indent math. Defaults to the rendered `--tree-indent` token. */
  indentPerLevel?: number;
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

const srOnly: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const defaultDropAnnouncement = <T extends TreeNode>({
  sourceValues,
  nextCollection,
}: TreeDropDetails<T>): string => {
  if (sourceValues.length > 1) return `Moved ${sourceValues.length} items.`;
  return `Moved ${nextCollection.stringify(sourceValues[0]) ?? "item"}.`;
};

export function TreeViewDndProvider<T extends TreeNode>({
  collection,
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
  indentPerLevel,
  blockReparent = false,
  autoExpandDelay = DEFAULT_AUTO_EXPAND_DELAY_MS,
  isNodeDraggable,
  scrollElement,
  autoScrollSpeed = "standard",
  children,
}: TreeViewDndProviderProps<T>) {
  const instanceId = useId();
  const [announcement, setAnnouncement] = useState("");

  // Keep collection / consumer callbacks current for the monitor and stable wrappers without
  // re-registering (and without letting inline callbacks churn the memoized context value).
  const collectionRef = useRef(collection);
  collectionRef.current = collection;
  const latestHandlers = {
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
  };
  const handlers = useRef(latestHandlers);
  handlers.current = latestHandlers;

  // Toggle a silent marker so identical consecutive messages still change the live region's text
  // node (screen readers re-announce the change but don't voice the zero-width space).
  const announceToggle = useRef(false);
  const announce = useCallback((message: string) => {
    announceToggle.current = !announceToggle.current;
    setAnnouncement(announceToggle.current ? message : `${message}\u200b`);
  }, []);

  // Single commit pipeline for both pointer drops and keyboard moves.
  const performMove = useCallback(
    (details: TreeDropDetails<T>) => {
      const h = handlers.current;
      h.onCollectionChange(details.nextCollection);
      announce((h.getDropAnnouncement ?? defaultDropAnnouncement)(details));
      Promise.resolve()
        .then(() => h.onDrop?.(details))
        .catch(() => {
          // Revert only if nothing newer has been committed since (avoid clobbering a later move).
          if (collectionRef.current === details.nextCollection) {
            h.onCollectionChange(details.previousCollection);
          }
        });
    },
    [announce],
  );

  const canDrag = useCallback((value: string) => {
    const fn = handlers.current.isNodeDraggable;
    if (!fn) return true;
    const node = collectionRef.current.findNode(value);
    return node ? fn(node) : true;
  }, []);

  const canDropWrapped = useCallback(
    (details: { sourceValue: string; targetValue: string; instruction: TreeDropInstruction }) =>
      handlers.current.canDrop?.(details) ?? true,
    [],
  );

  const getDragValuesWrapped = useCallback(
    (value: string) => handlers.current.getDragValues?.(value) ?? [value],
    [],
  );

  const getExtraDragDataWrapped = useCallback(
    (value: string) => handlers.current.getExtraDragData?.(value) ?? {},
    [],
  );

  const renderDragPreviewWrapped = useCallback(
    (value: string) => handlers.current.renderDragPreview?.(value) ?? null,
    [],
  );

  const moveByKeyboard = useCallback(
    (value: string, move: TreeKeyboardMove): boolean => {
      const h = handlers.current;
      if (!canDrag(value)) return false;
      if (move === "outdent" && blockReparent) return false;
      const result = moveNodeByKeyboard(collectionRef.current, value, move);
      if (!result) return false;
      if (
        h.canDrop?.({
          sourceValue: value,
          targetValue: result.targetValue,
          instruction: result.instruction,
        }) === false
      ) {
        return false;
      }
      performMove({
        sourceValues: [value],
        targetValue: result.targetValue,
        instruction: result.instruction,
        nextCollection: result.next,
        previousCollection: collectionRef.current,
      });
      return true;
    },
    [blockReparent, canDrag, performMove],
  );

  useEffect(() => {
    if (!enabled) return;
    return monitorForElements({
      canMonitor: ({ source }) => source.data[TREE_DND_INSTANCE_KEY] === instanceId,
      onDragStart: ({ source }) => {
        const sourceValue = String(source.data.value);
        const sourceValues = handlers.current.getDragValues?.(sourceValue) ?? [sourceValue];
        handlers.current.onDragStart?.({ sourceValue, sourceValues });
      },
      onDrop: ({ source, location }) => {
        handlers.current.onDragEnd?.();
        const target = location.current.dropTargets[0];
        if (!target) return;
        const instruction = extractInstruction(target.data);
        if (!instruction || instruction.type === "instruction-blocked") return;

        const sourceValue = String(source.data.value);
        const targetValue = String(target.data.value);
        if (handlers.current.canDrop?.({ sourceValue, targetValue, instruction }) === false) return;

        const sourceValues = handlers.current.getDragValues?.(sourceValue) ?? [sourceValue];
        const previous = collectionRef.current;
        const next = applyTreeDrop(previous, { sourceValues, targetValue, instruction });
        if (!next) return;

        performMove({
          sourceValues,
          targetValue,
          instruction,
          nextCollection: next,
          previousCollection: previous,
        });
      },
    });
  }, [instanceId, enabled, performMove]);

  // Edge auto-scroll; re-binds when the scroll element mounts/changes, constrained to vertical.
  useEffect(() => {
    if (!enabled || !scrollElement) return;
    return autoScrollForElements({
      element: scrollElement,
      getAllowedAxis: () => "vertical",
      getConfiguration: () => ({ maxScrollSpeed: handlers.current.autoScrollSpeed }),
    });
  }, [enabled, scrollElement]);

  const value = useMemo<TreeDndContextValue<T>>(
    () => ({
      instanceId,
      enabled,
      collectionRef,
      indentPerLevel,
      blockReparent,
      autoExpandDelay,
      canDrag,
      canDrop: canDropWrapped,
      getDragValues: getDragValuesWrapped,
      getExtraDragData: getExtraDragDataWrapped,
      renderDragPreview: renderDragPreviewWrapped,
      announce,
      moveByKeyboard,
    }),
    [
      instanceId,
      enabled,
      indentPerLevel,
      blockReparent,
      autoExpandDelay,
      canDrag,
      canDropWrapped,
      getDragValuesWrapped,
      getExtraDragDataWrapped,
      renderDragPreviewWrapped,
      announce,
      moveByKeyboard,
    ],
  );

  return (
    <TreeDndContext.Provider value={value as TreeDndContextValue}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        style={srOnly}
      >
        {announcement}
      </div>
    </TreeDndContext.Provider>
  );
}
