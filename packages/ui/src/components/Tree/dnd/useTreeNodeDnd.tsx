import { useTreeViewContext, useTreeViewNodeContext } from "@ark-ui/react/tree-view";
import {
  attachInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/utils/combine";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/set-custom-native-drag-preview";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import { useLatestRef } from "../../../hooks/useLatestRef";
import {
  readTreeDragSource,
  readTreeDropInstruction,
  TREE_DND_INSTANCE_KEY,
  useTreeDndContext,
} from "./TreeDndContext";
import { TreeDragPreview } from "./TreeDragPreview";
import {
  canNestInto,
  getItemMode,
  instructionLevel,
  isDescendantValue,
  isLastChildOfParent,
  type TreeDropInstruction,
  type TreeKeyboardMove,
} from "./treeDropLogic";

export interface UseTreeNodeDndReturn {
  /** Callback ref for the row element: the drag source and drop target. */
  ref: (element: HTMLElement | null) => void;
  /** Whether this row is the current drag source. */
  isDragging: boolean;
  /** The active drop instruction while a drag hovers this row, else `null`. */
  instruction: TreeDropInstruction | null;
  /** Portaled custom drag preview (render inside the row); `null` when unused. */
  dragPreview: ReactNode;
}

const FALLBACK_INDENT_PER_LEVEL = 20;

/** No-op ref used when DnD is disabled so the row doesn't churn state on mount. */
const NOOP_REF = () => {};

/**
 * Whether two instructions render an identical indicator. `extractInstruction` returns a fresh
 * object every `onDrag` (≈ every pointer frame), so without this the row re-renders each frame
 * even when nothing changed — the stutter seen while hovering steadily above/below a row.
 */
function isSameInstruction(a: TreeDropInstruction | null, b: TreeDropInstruction | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.type === b.type && instructionLevel(a) === instructionLevel(b);
}

/** Resolve a CSS length custom property to px (handles px/rem/em), else `fallback`. */
function readCssLengthPx(element: Element, varName: string, fallback: number): number {
  const raw = getComputedStyle(element).getPropertyValue(varName).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  if (raw.endsWith("rem")) {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(root) ? value * root : fallback;
  }
  if (raw.endsWith("em")) {
    const font = Number.parseFloat(getComputedStyle(element).fontSize);
    return Number.isFinite(font) ? value * font : fallback;
  }
  return value; // px or unitless
}

/**
 * The row is full-width with its content indented via `padding-inline-start`, so the row's
 * left edge sits `--tree-padding-inline` (base) left of the level-0 content origin. The hitbox
 * measures reparent levels from the element's left edge, so give it a rect shifted right by the
 * base inset — otherwise the reparent snapping is offset from the (content-aligned) indicator.
 */
function contentAlignedTarget(element: Element, baseInset: number): Element {
  const r = element.getBoundingClientRect();
  const rect = new DOMRect(r.left + baseInset, r.top, Math.max(0, r.width - baseInset), r.height);
  return { getBoundingClientRect: () => rect } as unknown as Element;
}

const isRtl = (element: Element) => getComputedStyle(element).direction === "rtl";

function mirrorForRtl<I extends { clientX: number }>(input: I, element: Element): I {
  if (!isRtl(element)) return input;
  const { left, right } = element.getBoundingClientRect();
  return { ...input, clientX: left + right - input.clientX };
}

/** Logical keyboard reorder for an arrow key, honoring the element's writing direction. */
function keyboardMoveForKey(key: string, element: HTMLElement): TreeKeyboardMove | undefined {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowRight" || key === "ArrowLeft") {
    const towardStart = isRtl(element) ? "ArrowRight" : "ArrowLeft";
    return key === towardStart ? "outdent" : "indent";
  }
  return undefined;
}

/**
 * Wire a tree row as a drag source + drop target + keyboard-reorder target. Reads the node from
 * Ark's NodeProvider context and the collection/config from {@link useTreeDndContext}, so it must
 * be called inside a `TreeView.Root`/`RootProvider` and a `TreeViewDndProvider`.
 */
export function useTreeNodeDnd(): UseTreeNodeDndReturn {
  const nodeState = useTreeViewNodeContext();
  const api = useTreeViewContext();
  const dnd = useTreeDndContext();

  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<TreeDropInstruction | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null);

  const value = nodeState.value;

  const snapshotRef = useLatestRef(nodeState);
  const apiRef = useLatestRef(api);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!element || !dnd || !dnd.enabled) return;
    const {
      instanceId,
      collectionRef,
      blockReparent,
      autoExpandDelay,
      canDrag,
      canDrop,
      getDragValues,
      getExtraDragData,
    } = dnd;

    const clearExpandTimer = () => {
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    };

    // Keyboard reorder (Ctrl/Cmd + arrows) attached natively so it composes with Ark's own
    // arrow-key navigation. Routes through moveByKeyboard so it obeys the same guards as drops.
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.target !== element || !(event.ctrlKey || event.metaKey)) return;
      const move = keyboardMoveForKey(event.key, element);
      if (!move) return;
      const drop = dnd.moveByKeyboard(value, move);
      if (!drop) return;
      event.preventDefault();
      event.stopPropagation();
      if (drop.instruction.type === "make-child") apiRef.current.expand([drop.targetValue]);
      requestAnimationFrame(() => apiRef.current.focus(value));
    };
    element.addEventListener("keydown", handleKeyDown);

    const cleanup = combine(
      draggable({
        element,
        canDrag: () => canDrag(value),
        // Reserved keys last so consumer extra data can't clobber the instance id / value.
        getInitialData: () => ({
          ...getExtraDragData(value),
          [TREE_DND_INSTANCE_KEY]: instanceId,
          value,
        }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          // Always a compact offset chip (never the full-row native image) so target + indicator stay visible.
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
            render: ({ container }) => {
              // flushSync so the portal is committed into `container` before pdnd snapshots it.
              flushSync(() => setPreviewContainer(container));
              return () => setPreviewContainer(null);
            },
          });
        },
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          const sourceValue = readTreeDragSource(source.data, instanceId);
          if (sourceValue === null) return false;
          const dragValues = getDragValues(sourceValue);
          if (dragValues.includes(value)) return false; // can't drop onto a dragged node
          // No affordance for drops applyTreeDrop would reject (target inside a dragged subtree).
          return !dragValues.some((dv) => isDescendantValue(collectionRef.current, dv, value));
        },
        getData: ({ input, element: el }) => {
          const { indexPath, isBranch, expanded } = snapshotRef.current;
          const mode = getItemMode({
            isBranch,
            isExpanded: expanded,
            isLastChild: isLastChildOfParent(collectionRef.current, indexPath),
          });
          const block: Instruction["type"][] = [];
          if (blockReparent) block.push("reparent");
          const collection = collectionRef.current;
          if (!canNestInto(collection, collection.at(indexPath), expanded)) {
            block.push("make-child");
          }
          const indent = readCssLengthPx(el, "--tree-indent", FALLBACK_INDENT_PER_LEVEL);
          const baseInset = readCssLengthPx(el, "--tree-padding-inline", 0);
          return attachInstruction(
            { [TREE_DND_INSTANCE_KEY]: instanceId, value },
            {
              input: mirrorForRtl(input, el),
              element: contentAlignedTarget(el, baseInset),
              currentLevel: indexPath.length - 1,
              indentPerLevel: indent,
              mode,
              block,
            },
          );
        },
        onDragEnter: () => {
          // Auto-expand a hovered collapsed branch so its children become droppable/visible.
          const { isBranch, expanded } = snapshotRef.current;
          if (isBranch && !expanded && autoExpandDelay !== false) {
            clearExpandTimer();
            expandTimerRef.current = setTimeout(
              () => apiRef.current.expand([value]),
              autoExpandDelay,
            );
          }
        },
        onDrag: ({ self, source }) => {
          const sourceValue = readTreeDragSource(source.data, instanceId);
          const hovered = readTreeDropInstruction(self.data);
          const next =
            hovered &&
            sourceValue !== null &&
            canDrop({ sourceValue, targetValue: value, instruction: hovered })
              ? hovered
              : null;
          setInstruction((current) => (isSameInstruction(current, next) ? current : next));
        },
        onDragLeave: () => {
          clearExpandTimer();
          setInstruction(null);
        },
        onDrop: () => {
          clearExpandTimer();
          setInstruction(null);
        },
      }),
    );

    return () => {
      clearExpandTimer();
      element.removeEventListener("keydown", handleKeyDown);
      cleanup();
    };
  }, [element, dnd, value, apiRef, snapshotRef]);

  const dragPreview =
    previewContainer && dnd
      ? createPortal(
          dnd.renderDragPreview(value) ?? (
            <TreeDragPreview
              label={dnd.collectionRef.current.stringify(value) ?? ""}
              count={dnd.getDragValues(value).length}
            />
          ),
          previewContainer,
        )
      : null;

  return {
    ref: dnd?.enabled ? setElement : NOOP_REF,
    isDragging,
    instruction,
    dragPreview,
  };
}
