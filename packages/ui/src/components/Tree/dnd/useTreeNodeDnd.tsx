import {
  attachInstruction,
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cssLengthToPx } from "../../../foundations/cssSize";
import { isRtl } from "../../../foundations/dom";
import { useLatestRef } from "../../../hooks/useLatestRef";
import {
  isCrossOrientationCloseKey,
  isCrossOrientationOpenKey,
} from "../../../primitives/composite";
import { useLocale } from "../../../primitives/locale";
import { DragPreview, defineDragType, readDragData, toDragData, useDragSource } from "../../dnd";
import { useTreeContext, useTreeNodeState } from "../TreeView";
import { readTreeDropInstruction, useTreeDndContext } from "./TreeDndContext";
import {
  canNestInto,
  getItemMode,
  instructionLevel,
  isDropTargetValid,
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

const NO_DRAG_TYPE = defineDragType<string>("tree-node");

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

const readCssLengthPx = (element: Element, varName: string, fallback: number): number =>
  cssLengthToPx(getComputedStyle(element).getPropertyValue(varName), element) ?? fallback;

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

function mirrorForRtl<I extends { clientX: number }>(input: I, element: Element): I {
  if (!isRtl(element)) return input;
  const { left, right } = element.getBoundingClientRect();
  return { ...input, clientX: left + right - input.clientX };
}

/** Logical keyboard reorder for an arrow key, honoring the writing direction. */
function keyboardMoveForKey(key: string, rtl: boolean): TreeKeyboardMove | undefined {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (isCrossOrientationCloseKey(key, rtl)) return "outdent";
  if (isCrossOrientationOpenKey(key, rtl)) return "indent";
  return undefined;
}

/**
 * Wire a tree row as a drag source + drop target + keyboard-reorder target. Reads the node from
 * `TreeView.NodeProvider` and the nodes/config from {@link useTreeDndContext}, so it must be
 * called inside a `TreeView.Root` and a `TreeViewDndProvider`.
 */
export function useTreeNodeDnd(): UseTreeNodeDndReturn {
  const nodeState = useTreeNodeState();
  const { tree } = useTreeContext();
  const dnd = useTreeDndContext();
  const rtl = useLocale().dir === "rtl";

  const [instruction, setInstruction] = useState<TreeDropInstruction | null>(null);

  const value = nodeState.value;
  const dragSource = useDragSource({
    type: dnd?.dragType ?? NO_DRAG_TYPE,
    getData: () => value,
    getExtraData: () => dnd?.getExtraDragData(value) ?? {},
    canDrag: () => dnd?.canDrag(value) ?? false,
    renderPreview: () =>
      dnd
        ? (dnd.renderDragPreview(value) ?? (
            <DragPreview
              label={dnd.collectionRef.current.stringify(value) ?? ""}
              count={dnd.getDragValues(value).length}
            />
          ))
        : null,
    disabled: !dnd || dnd.disabled,
  });
  const { element } = dragSource;

  const snapshotRef = useLatestRef(nodeState);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!element || !dnd || dnd.disabled) return;
    const {
      dragType,
      collectionRef,
      blockReparent,
      autoExpandDelay,
      canDrop,
      isBranchLoaded,
      getDragValues,
    } = dnd;

    const clearExpandTimer = () => {
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.target !== element || !(event.ctrlKey || event.metaKey)) return;
      const move = keyboardMoveForKey(event.key, rtl);
      if (!move) return;
      const drop = dnd.moveByKeyboard(value, move);
      if (!drop) return;
      event.preventDefault();
      event.stopPropagation();
      requestAnimationFrame(() => {
        tree.focus(value);
        if (element.isConnected) element.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    };
    element.addEventListener("keydown", handleKeyDown);

    const cleanup = dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        const sourceValue = readDragData(dragType, source.data);
        return (
          sourceValue !== undefined &&
          isDropTargetValid(collectionRef.current, getDragValues(sourceValue), value)
        );
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
        if (!canNestInto(collection, collection.at(indexPath), isBranchLoaded(value))) {
          block.push("make-child");
        }
        const indent = readCssLengthPx(el, "--tree-indent", FALLBACK_INDENT_PER_LEVEL);
        const baseInset = readCssLengthPx(el, "--tree-padding-inline", 0);
        return attachInstruction(toDragData(dragType, value), {
          input: mirrorForRtl(input, el),
          element: contentAlignedTarget(el, baseInset),
          currentLevel: indexPath.length - 1,
          indentPerLevel: indent,
          mode,
          block,
        });
      },
      onDragEnter: () => {
        // Auto-expand a hovered collapsed branch so its children become droppable/visible.
        const { isBranch, expanded } = snapshotRef.current;
        if (isBranch && !expanded && autoExpandDelay !== false) {
          clearExpandTimer();
          expandTimerRef.current = setTimeout(() => tree.expand([value]), autoExpandDelay);
        }
      },
      onDrag: ({ self, source }) => {
        const sourceValue = readDragData(dragType, source.data);
        const hovered = readTreeDropInstruction(self.data);
        const next =
          hovered &&
          sourceValue !== undefined &&
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
    });

    return () => {
      clearExpandTimer();
      element.removeEventListener("keydown", handleKeyDown);
      cleanup();
    };
  }, [element, dnd, value, tree, rtl, snapshotRef]);

  return {
    ref: dnd && !dnd.disabled ? dragSource.ref : NOOP_REF,
    isDragging: dragSource.isDragging,
    instruction,
    dragPreview: dragSource.preview,
  };
}
