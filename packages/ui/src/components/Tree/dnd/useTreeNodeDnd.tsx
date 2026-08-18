import { useTreeViewContext, useTreeViewNodeContext } from "@ark-ui/react/tree-view";
import {
  attachInstruction,
  extractInstruction,
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

import { TREE_DND_INSTANCE_KEY, useTreeDndContext } from "./TreeDndContext";
import { TreeDragPreview } from "./TreeDragPreview";
import {
  getItemMode,
  isDescendantValue,
  isLastChildOfParent,
  type TreeKeyboardMove,
} from "./treeDropLogic";

export interface UseTreeNodeDndReturn {
  /** Callback ref for the row element (drop target, and drag source unless a handle is set). */
  ref: (element: HTMLElement | null) => void;
  /** Optional callback ref for a dedicated drag handle within the row. */
  dragHandleRef: (element: HTMLElement | null) => void;
  /** Whether this row is the current drag source. */
  isDragging: boolean;
  /** The active drop instruction while a drag hovers this row, else `null`. */
  instruction: Instruction | null;
  /** Portaled custom drag preview (render inside the row); `null` when unused. */
  dragPreview: ReactNode;
}

const FALLBACK_INDENT_PER_LEVEL = 20;

/** No-op ref used when DnD is disabled so the row doesn't churn state on mount. */
const NOOP_REF = () => {};

/** The level the indicator renders at for an instruction (matches TreeDropIndicator). */
function instructionLevel(instruction: Instruction): number | undefined {
  if (instruction.type === "reparent") return instruction.desiredLevel;
  if (instruction.type === "instruction-blocked") return undefined;
  return instruction.currentLevel;
}

/**
 * Whether two instructions render an identical indicator. `extractInstruction` returns a fresh
 * object every `onDrag` (≈ every pointer frame), so without this the row re-renders each frame
 * even when nothing changed — the stutter seen while hovering steadily above/below a row.
 */
function isSameInstruction(a: Instruction | null, b: Instruction | null): boolean {
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

/** Logical keyboard reorder for an arrow key, honoring the element's writing direction. */
function keyboardMoveForKey(key: string, element: HTMLElement): TreeKeyboardMove | undefined {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowRight" || key === "ArrowLeft") {
    const rtl = getComputedStyle(element).direction === "rtl";
    const towardStart = rtl ? "ArrowRight" : "ArrowLeft";
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
  const [handle, setHandle] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null);

  const value = nodeState.value;

  // Latest node geometry / api, read inside handlers (drag time) so registration is stable.
  const snapshotRef = useRef(nodeState);
  const apiRef = useRef(api);

  useEffect(() => {
    snapshotRef.current = nodeState;
    apiRef.current = api;
  });
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!element || !dnd || !dnd.enabled) return;
    const {
      instanceId,
      collectionRef,
      indentPerLevel,
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
      if (!(event.ctrlKey || event.metaKey)) return;
      const move = keyboardMoveForKey(event.key, element);
      if (!move) return;
      if (dnd.moveByKeyboard(value, move)) {
        event.preventDefault();
        event.stopPropagation();
        requestAnimationFrame(() => apiRef.current.focus(value));
      }
    };
    element.addEventListener("keydown", handleKeyDown);

    const cleanup = combine(
      draggable({
        element,
        dragHandle: handle ?? undefined,
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
          if (source.data[TREE_DND_INSTANCE_KEY] !== instanceId) return false;
          const sourceValue = source.data.value;
          if (typeof sourceValue !== "string") return false;
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
          if (!isBranch) block.push("make-child"); // never nest into a leaf
          const indent = readCssLengthPx(
            el,
            "--tree-indent",
            indentPerLevel ?? FALLBACK_INDENT_PER_LEVEL,
          );
          const baseInset = readCssLengthPx(el, "--tree-padding-inline", 0);
          return attachInstruction(
            { [TREE_DND_INSTANCE_KEY]: instanceId, value },
            {
              input,
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
          const next = extractInstruction(self.data);
          // Suppress the indicator for drops a consumer canDrop would veto.
          if (next && next.type !== "instruction-blocked") {
            const sourceValue = source.data.value;
            if (
              typeof sourceValue === "string" &&
              canDrop({ sourceValue, targetValue: value, instruction: next }) === false
            ) {
              setInstruction(null);
              return;
            }
          }
          // Only update when the rendered indicator actually changes, to avoid per-frame churn.
          setInstruction((current) => (isSameInstruction(current, next) ? current : next));
        },
        onDragLeave: () => {
          clearExpandTimer();
          setInstruction(null);
        },
        onDrop: ({ self }) => {
          clearExpandTimer();
          setInstruction(null);
          // Reveal the moved node if it was nested into a collapsed branch.
          const dropped = extractInstruction(self.data);
          if (
            autoExpandDelay !== false &&
            dropped?.type === "make-child" &&
            !snapshotRef.current.expanded
          ) {
            apiRef.current.expand([value]);
          }
        },
      }),
    );

    return () => {
      clearExpandTimer();
      element.removeEventListener("keydown", handleKeyDown);
      cleanup();
    };
  }, [element, handle, dnd, value]);

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
    dragHandleRef: dnd?.enabled ? setHandle : NOOP_REF,
    isDragging,
    instruction,
    dragPreview,
  };
}
