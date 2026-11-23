import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type SortableVariantProps, sortable as sortableRecipe } from "#styled-system/recipes";

import { isRtl } from "../../foundations/dom";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { getArrowStep } from "../../primitives/composite";
import { useLocale } from "../../primitives/locale";
import { renderable } from "../../primitives/render";
import {
  type DragType,
  DragPreview,
  defineDragType,
  readDragData,
  toDragData,
  useDragAutoScroll,
  useDragSource,
} from "../dnd";
import { createPartContext } from "../partContext";
import { Tooltip } from "../Tooltip";
import {
  type SortableAxis,
  type SortableCanDropDetails,
  type SortableDropOntoDetails,
  type SortableEdge,
  type SortableInstruction,
  type SortableReorderDetails,
  getSortableInstruction,
  isNoopReorder,
} from "./sortableLogic";

const { withProvider, withContext } = createSlotRecipeContext(sortableRecipe);

const StyledRoot = withProvider(renderable.div, "root");
const StyledItem = withContext(renderable.div, "item");
const StyledHandle = withContext(renderable.button, "handle");
const StyledIndicator = withContext(renderable.div, "indicator");

interface SortableDragData {
  value: string;
  label: string;
}

type DragData = Record<string | symbol, unknown>;

const readInstruction = (data: DragData) =>
  (data.instruction as SortableInstruction | null | undefined) ?? null;

const instructionKind = (instruction: SortableInstruction) =>
  instruction.type === "onto" ? "onto" : instruction.edge;

const STEP_KEYS: Record<SortableAxis, [back: string, forward: string]> = {
  vertical: ["ArrowUp", "ArrowDown"],
  horizontal: ["ArrowLeft", "ArrowRight"],
};

interface SortableContextValue {
  dragType: DragType<SortableDragData>;
  axis: SortableAxis;
  disabled: boolean;
  valuesRef: Readonly<RefObject<readonly string[]>>;
  canDrop: (details: SortableCanDropDetails) => boolean;
  renderDragPreview: (value: string) => ReactNode;
  moveByKeyboard: (value: string, label: string, step: -1 | 1) => boolean;
}

const [SortableContext, useSortableContext] = createPartContext<SortableContextValue>(
  "<Sortable.Root>",
  "Sortable parts",
);

interface SortableItemContextValue {
  value: string;
  label: string;
  disabled: boolean;
  setHandle: (element: HTMLElement | null) => void;
}

const [SortableItemContext, useSortableItemContext] = createPartContext<SortableItemContextValue>(
  "<Sortable.Item>",
  "Sortable.Handle",
);

export interface SortableRootProps extends Omit<
  ComponentProps<typeof StyledRoot>,
  "axis" | "handleVisibility"
> {
  /** Item values in display order. */
  values: readonly string[];
  /** Direction the items run and are dragged along. @default "vertical" */
  axis?: SortableAxis;
  /**
   * `hover` shows each handle only while its item is hovered, focused within or dragged, and
   * always on touch screens. @default "hover"
   */
  handleVisibility?: SortableVariantProps["handleVisibility"];
  /**
   * Called when an item is dropped beside another, or moved with the arrow keys on its handle.
   * Drops that would leave the order unchanged are not offered.
   */
  onReorder: (details: SortableReorderDetails) => void;
  /**
   * Called when an item is dropped onto another. Passing it gives each item's middle third to
   * dropping onto it, leaving the outer thirds to reordering.
   */
  onDropOnto?: (details: SortableDropOntoDetails) => void;
  /**
   * Veto a drop; the target then shows no indicator. A vetoed `onto` splits the target into
   * before and after halves instead.
   */
  canDrop?: (details: SortableCanDropDetails) => boolean;
  /** Render custom drag-preview content (portaled). Return nothing to use the default pill. */
  renderDragPreview?: (value: string) => ReactNode;
  /** Build the screen-reader announcement for a reorder. @default "Moved {label}." */
  getDropAnnouncement?: (details: SortableReorderDetails) => string;
  /** Scroll container to auto-scroll along `axis` near its edges during a drag. */
  scrollElement?: Element | null;
  /** Turn dragging and keyboard moves off. @default false */
  disabled?: boolean;
}

function Root({
  ref,
  values,
  axis = "vertical",
  handleVisibility,
  onReorder,
  onDropOnto,
  canDrop,
  renderDragPreview,
  getDropAnnouncement,
  scrollElement,
  disabled = false,
  children,
  ...props
}: SortableRootProps) {
  const [dragType] = useState(() => defineDragType<SortableDragData>("sortable-item"));
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, setRootElement);
  const { announce, liveRegion } = useAnnouncer();
  const valuesRef = useLatestRef(values);
  const handlers = useLatestRef({
    onReorder,
    onDropOnto,
    canDrop,
    renderDragPreview,
    getDropAnnouncement,
  });

  const [context, reorder] = useMemo(() => {
    const allowsDrop = (details: SortableCanDropDetails) => {
      const h = handlers.current;
      if (details.instruction.type === "onto" && !h.onDropOnto) return false;
      return h.canDrop?.(details) ?? true;
    };

    const commitReorder = (details: SortableReorderDetails, label: string) => {
      const h = handlers.current;
      h.onReorder(details);
      announce(h.getDropAnnouncement?.(details) ?? `Moved ${label}.`);
    };

    const value: SortableContextValue = {
      dragType,
      axis,
      disabled,
      valuesRef,
      canDrop: allowsDrop,
      renderDragPreview: (itemValue) => handlers.current.renderDragPreview?.(itemValue) ?? null,
      moveByKeyboard: (sourceValue, label, step) => {
        const order = valuesRef.current;
        const index = order.indexOf(sourceValue);
        const targetValue = index < 0 ? undefined : order[index + step];
        if (targetValue === undefined) return false;
        const edge: SortableEdge = step < 0 ? "before" : "after";
        if (!allowsDrop({ sourceValue, targetValue, instruction: { type: "reorder", edge } })) {
          return false;
        }
        commitReorder({ sourceValue, targetValue, edge }, label);
        return true;
      },
    };
    return [value, commitReorder] as const;
  }, [dragType, axis, disabled, valuesRef, handlers, announce]);

  useEffect(() => {
    if (disabled) return;
    return monitorForElements({
      canMonitor: ({ source }) => readDragData(dragType, source.data) !== undefined,
      onDrop: ({ source, location }) => {
        const dragged = readDragData(dragType, source.data);
        const target = location.current.dropTargets[0];
        const targetValue = target && readDragData(dragType, target.data)?.value;
        const instruction = target && readInstruction(target.data);
        if (!dragged || targetValue === undefined || !instruction) return;
        if (instruction.type === "onto") {
          handlers.current.onDropOnto?.({ sourceValue: dragged.value, targetValue });
          return;
        }
        reorder({ sourceValue: dragged.value, targetValue, edge: instruction.edge }, dragged.label);
      },
    });
  }, [disabled, dragType, handlers, reorder]);

  // Items stick as drop targets only while the pointer stays over the root, as in their gaps.
  useEffect(() => {
    if (disabled || !rootElement) return;
    return dropTargetForElements({
      element: rootElement,
      canDrop: ({ source }) => readDragData(dragType, source.data) !== undefined,
    });
  }, [disabled, rootElement, dragType]);

  useDragAutoScroll({
    element: scrollElement,
    axis,
    disabled,
    canScroll: ({ source }) => readDragData(dragType, source.data) !== undefined,
  });

  return (
    <SortableContext.Provider value={context}>
      <StyledRoot
        ref={composedRef}
        axis={axis}
        handleVisibility={handleVisibility}
        {...props}
      >
        {children}
      </StyledRoot>
      {liveRegion}
    </SortableContext.Provider>
  );
}

export interface SortableItemProps extends ComponentProps<typeof StyledItem> {
  /** The item's entry in the root's `values`. */
  value: string;
  /** Names the item in the drag preview, the reorder announcement and its handle's name. */
  label: string;
  /** Keep the item from being dragged or moved; it still takes drops. @default false */
  disabled?: boolean;
}

interface ItemDrop {
  instruction: SortableInstruction;
  offset: number;
}

function Item({ ref, value, label, disabled = false, children, ...props }: SortableItemProps) {
  const sortable = useSortableContext();
  const [handle, setHandle] = useState<HTMLElement | null>(null);
  const [drop, setDrop] = useState<ItemDrop | null>(null);
  const source = useDragSource({
    type: sortable.dragType,
    getData: () => ({ value, label }),
    canDrag: () => !disabled,
    dragHandle: handle,
    renderPreview: () => sortable.renderDragPreview(value) ?? <DragPreview label={label} />,
    disabled: sortable.disabled,
  });
  const { element } = source;
  const composedRef = useComposedRefs(ref, source.ref);

  useEffect(() => {
    if (!element || sortable.disabled) return;
    const { dragType, axis, valuesRef, canDrop } = sortable;

    const instructionFor = (
      sourceValue: string,
      client: { x: number; y: number },
      target: Element,
    ): SortableInstruction | null => {
      const allowOnto = canDrop({
        sourceValue,
        targetValue: value,
        instruction: { type: "onto" },
      });
      const instruction = getSortableInstruction({
        client,
        rect: target.getBoundingClientRect(),
        axis,
        rtl: isRtl(target),
        allowOnto,
      });
      if (instruction.type === "onto") return instruction;
      const details = { sourceValue, targetValue: value, edge: instruction.edge };
      if (isNoopReorder(valuesRef.current, details)) return null;
      return canDrop({ sourceValue, targetValue: value, instruction }) ? instruction : null;
    };

    const offsetFor = (target: Element, edge: SortableEdge) => {
      const order = valuesRef.current;
      const index = order.indexOf(value);
      if (index < 0 || order[edge === "before" ? index - 1 : index + 1] === undefined) return 0;
      const style = getComputedStyle(target.parentElement ?? target);
      const gap = Number.parseFloat(axis === "vertical" ? style.rowGap : style.columnGap);
      return (Number.isFinite(gap) ? gap / 2 : 0) + 1;
    };

    const show = (data: DragData, target: Element) => {
      const instruction = readInstruction(data);
      setDrop((current) => {
        if (!instruction) return null;
        if (current && instructionKind(current.instruction) === instructionKind(instruction)) {
          return current;
        }
        return {
          instruction,
          offset: instruction.type === "onto" ? 0 : offsetFor(target, instruction.edge),
        };
      });
    };

    return dropTargetForElements({
      element,
      canDrop: ({ source: dragged }) => {
        const data = readDragData(dragType, dragged.data);
        return data !== undefined && data.value !== value;
      },
      getIsSticky: () => true,
      getData: ({ input, element: target, source: dragged }) => ({
        ...toDragData(dragType, { value, label }),
        instruction: instructionFor(
          readDragData(dragType, dragged.data)?.value ?? "",
          { x: input.clientX, y: input.clientY },
          target,
        ),
      }),
      onDragEnter: ({ self }) => show(self.data, self.element),
      onDrag: ({ self }) => show(self.data, self.element),
      onDragLeave: () => setDrop(null),
      onDrop: () => setDrop(null),
    });
  }, [element, sortable, value, label]);

  const itemContext = useMemo(
    () => ({ value, label, disabled, setHandle }),
    [value, label, disabled],
  );

  const indicatorStyle: CSSProperties & { "--sortable-indicator-offset"?: string } = {
    "--sortable-indicator-offset": `${drop?.offset ?? 0}px`,
  };

  return (
    <SortableItemContext.Provider value={itemContext}>
      <StyledItem
        data-reveal-group=""
        data-dragging={source.isDragging || undefined}
        {...props}
        ref={composedRef}
      >
        {children}
        {drop && (
          <StyledIndicator
            aria-hidden="true"
            data-instruction={instructionKind(drop.instruction)}
            style={indicatorStyle}
          />
        )}
        {source.preview}
      </StyledItem>
    </SortableItemContext.Provider>
  );
}

export interface SortableHandleProps extends ComponentProps<typeof StyledHandle> {
  /** Tooltip, and with the item's `label` after it the accessible name. @default "Drag to move" */
  label?: string;
}

function Handle({
  ref,
  label = "Drag to move",
  disabled,
  onKeyDown,
  children,
  ...props
}: SortableHandleProps) {
  const sortable = useSortableContext();
  const item = useSortableItemContext();
  const composedRef = useComposedRefs<HTMLButtonElement>(ref, item.setHandle);
  const rtl = useLocale().dir === "rtl";
  const vertical = sortable.axis === "vertical";

  return (
    <Tooltip label={label}>
      <StyledHandle
        type={props.render ? undefined : "button"}
        aria-label={`${label} ${item.label}`}
        aria-keyshortcuts={STEP_KEYS[sortable.axis].join(" ")}
        {...props}
        ref={composedRef}
        disabled={disabled || item.disabled || sortable.disabled}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const step = getArrowStep(event.key, sortable.axis, rtl);
          if (step === 0 || !sortable.moveByKeyboard(item.value, item.label, step)) return;
          event.preventDefault();
          const handle = event.currentTarget;
          // React restores focus and its ancestors' scroll after the move, leaving the handle out of view.
          requestAnimationFrame(() => {
            handle.focus({ preventScroll: true });
            handle.scrollIntoView({ block: "nearest", inline: "nearest" });
          });
        }}
      >
        {children ?? (vertical ? <GripVerticalIcon /> : <GripHorizontalIcon />)}
      </StyledHandle>
    </Tooltip>
  );
}

/**
 * Drag-and-drop reordering of a list. `Root` lays its `Item`s out along `axis` and reports drops
 * through `onReorder` (and `onDropOnto`, when given); apply them with `applySortableReorder`. An
 * item drags by its `Handle` when it has one, otherwise from anywhere on it. A focused handle
 * moves its item with the arrow keys along the axis.
 */
export const Sortable = { Root, Item, Handle };
