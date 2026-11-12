import { ark } from "@ark-ui/react/factory";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/utils/combine";
import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import { type SortableVariantProps, sortable as sortableRecipe } from "#styled-system/recipes";

import { useAnnouncer } from "../../hooks/useAnnouncer";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import type { WithRef } from "../../types";
import { Tooltip } from "../Tooltip";
import { DragPreview } from "./DragPreview";
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
import { useDragAutoScroll } from "./useDragAutoScroll";
import { useNativeDragPreview } from "./useNativeDragPreview";

const { withProvider, withContext } = createSlotRecipeContext(sortableRecipe);

const StyledRoot = withProvider(ark.div, "root");
const StyledItem = withContext(ark.div, "item");
const StyledHandle = withContext(ark.button, "handle");
const StyledIndicator = withContext(ark.div, "indicator");

const SORTABLE_INSTANCE_KEY = "construkt-sortable-instance";

type DragData = Record<string | symbol, unknown>;

function readSource(data: DragData, instanceId: string) {
  return data[SORTABLE_INSTANCE_KEY] === instanceId && typeof data.value === "string"
    ? { value: data.value, label: String(data.label) }
    : null;
}

function readTarget(data: DragData, instanceId: string) {
  return data[SORTABLE_INSTANCE_KEY] === instanceId && typeof data.value === "string"
    ? { value: data.value, instruction: data.instruction as SortableInstruction | null }
    : null;
}

const isRtl = (element: Element) => getComputedStyle(element).direction === "rtl";

const instructionKind = (instruction: SortableInstruction) =>
  instruction.type === "onto" ? "onto" : instruction.edge;

const STEP_KEYS: Record<SortableAxis, [back: string, forward: string]> = {
  vertical: ["ArrowUp", "ArrowDown"],
  horizontal: ["ArrowLeft", "ArrowRight"],
};

function keyboardStep(key: string, axis: SortableAxis, element: Element): -1 | 0 | 1 {
  const [back, forward] = STEP_KEYS[axis];
  if (key !== back && key !== forward) return 0;
  const mirrored = axis === "horizontal" && isRtl(element);
  return (key === forward) !== mirrored ? 1 : -1;
}

interface SortableContextValue {
  instanceId: string;
  axis: SortableAxis;
  disabled: boolean;
  valuesRef: Readonly<RefObject<readonly string[]>>;
  canDrop: (details: SortableCanDropDetails) => boolean;
  renderDragPreview: (value: string) => ReactNode;
  moveByKeyboard: (value: string, label: string, step: -1 | 1) => boolean;
}

const SortableContext = createContext<SortableContextValue | null>(null);

function useSortableContext(): SortableContextValue {
  const context = useContext(SortableContext);
  if (!context) throw new Error("Sortable parts must be rendered inside Sortable.Root.");
  return context;
}

interface SortableItemContextValue {
  value: string;
  label: string;
  disabled: boolean;
  setHandle: (element: HTMLElement | null) => void;
}

const SortableItemContext = createContext<SortableItemContextValue | null>(null);

function useSortableItemContext(): SortableItemContextValue {
  const context = useContext(SortableItemContext);
  if (!context) throw new Error("Sortable.Handle must be rendered inside Sortable.Item.");
  return context;
}

export interface SortableRootProps extends HTMLStyledProps<"div"> {
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
}: WithRef<SortableRootProps>) {
  const instanceId = useId();
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
      instanceId,
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
  }, [instanceId, axis, disabled, valuesRef, handlers, announce]);

  useEffect(() => {
    if (disabled) return;
    return monitorForElements({
      canMonitor: ({ source }) => readSource(source.data, instanceId) !== null,
      onDrop: ({ source, location }) => {
        const dragged = readSource(source.data, instanceId);
        const target = location.current.dropTargets[0];
        const drop = target ? readTarget(target.data, instanceId) : null;
        if (!dragged || !drop?.instruction) return;
        if (drop.instruction.type === "onto") {
          handlers.current.onDropOnto?.({ sourceValue: dragged.value, targetValue: drop.value });
          return;
        }
        reorder(
          { sourceValue: dragged.value, targetValue: drop.value, edge: drop.instruction.edge },
          dragged.label,
        );
      },
    });
  }, [disabled, instanceId, handlers, reorder]);

  // Items stick as drop targets only while the pointer stays over the root, as in their gaps.
  useEffect(() => {
    if (disabled || !rootElement) return;
    return dropTargetForElements({
      element: rootElement,
      canDrop: ({ source }) => readSource(source.data, instanceId) !== null,
    });
  }, [disabled, rootElement, instanceId]);

  useDragAutoScroll({
    element: scrollElement,
    axis,
    enabled: !disabled,
    canScroll: ({ source }) => readSource(source.data, instanceId) !== null,
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

export interface SortableItemProps extends HTMLStyledProps<"div"> {
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

function Item({
  ref,
  value,
  label,
  disabled = false,
  children,
  ...props
}: WithRef<SortableItemProps>) {
  const sortable = useSortableContext();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [handle, setHandle] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [drop, setDrop] = useState<ItemDrop | null>(null);
  const { container: previewContainer, onGenerateDragPreview } = useNativeDragPreview();
  const composedRef = useComposedRefs(ref, setElement);
  const labelRef = useLatestRef(label);

  useEffect(() => {
    if (!element || sortable.disabled) return;
    const { instanceId, axis, valuesRef, canDrop } = sortable;

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
      const instruction = (data.instruction as SortableInstruction | null | undefined) ?? null;
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

    return combine(
      draggable({
        element,
        dragHandle: handle ?? undefined,
        canDrag: () => !disabled,
        getInitialData: () => ({
          [SORTABLE_INSTANCE_KEY]: instanceId,
          value,
          label: labelRef.current,
        }),
        onGenerateDragPreview,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          const dragged = readSource(source.data, instanceId);
          return dragged !== null && dragged.value !== value;
        },
        getIsSticky: () => true,
        getData: ({ input, element: target, source }) => ({
          [SORTABLE_INSTANCE_KEY]: instanceId,
          value,
          instruction: instructionFor(
            readSource(source.data, instanceId)?.value ?? "",
            { x: input.clientX, y: input.clientY },
            target,
          ),
        }),
        onDragEnter: ({ self }) => show(self.data, self.element),
        onDrag: ({ self }) => show(self.data, self.element),
        onDragLeave: () => setDrop(null),
        onDrop: () => setDrop(null),
      }),
    );
  }, [element, handle, sortable, value, disabled, labelRef, onGenerateDragPreview]);

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
        data-dragging={isDragging || undefined}
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
        {previewContainer &&
          createPortal(
            sortable.renderDragPreview(value) ?? <DragPreview label={label} />,
            previewContainer,
          )}
      </StyledItem>
    </SortableItemContext.Provider>
  );
}

export interface SortableHandleProps extends HTMLStyledProps<"button"> {
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
}: WithRef<SortableHandleProps, HTMLButtonElement>) {
  const sortable = useSortableContext();
  const item = useSortableItemContext();
  const composedRef = useComposedRefs<HTMLButtonElement>(ref, item.setHandle);
  const vertical = sortable.axis === "vertical";

  return (
    <Tooltip label={label}>
      <StyledHandle
        type="button"
        aria-label={`${label} ${item.label}`}
        aria-keyshortcuts={STEP_KEYS[sortable.axis].join(" ")}
        {...props}
        ref={composedRef}
        disabled={disabled || item.disabled || sortable.disabled}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const step = keyboardStep(event.key, sortable.axis, event.currentTarget);
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
