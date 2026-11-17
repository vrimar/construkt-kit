import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { type ReactNode, useEffect, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import { useNativeDragPreview } from "./useNativeDragPreview";

/**
 * A kind of drag: the data its sources carry and the drop targets that take it. Sources and
 * targets of different types never meet, so lists can share a page without seeing each other.
 */
export interface DragType<T> {
  readonly name: string;
  /** Typed data slot; never set at runtime. */
  readonly __data?: T;
}

const keys = new WeakMap<DragType<unknown>, symbol>();

const keyOf = (type: DragType<unknown>) => {
  let key = keys.get(type);
  if (!key) {
    key = Symbol(type.name);
    keys.set(type, key);
  }
  return key;
};

/** Declares a drag type; define it once at module level and share it between source and target. */
export function defineDragType<T>(name: string): DragType<T> {
  return { name };
}

export interface UseDraggableOptions<T> {
  type: DragType<T>;
  /** The data drop targets receive, read when the drag starts. */
  getData: () => T;
  /**
   * Native drag data by MIME type, for drop zones that read `dataTransfer` rather than this
   * hook's data, such as DataGrid's `onExternalDrop`.
   */
  getExternalData?: () => Record<string, string>;
  /** Drag image content, such as a `DragPreview`; the element itself when absent. */
  renderPreview?: () => ReactNode;
  /** @default false */
  disabled?: boolean;
}

export interface UseDraggableReturn {
  /** Attach to the element that starts the drag. */
  ref: (element: HTMLElement | null) => void;
  isDragging: boolean;
  /** Render anywhere in the source's tree while `renderPreview` is set. */
  preview: ReactNode;
}

/** Makes an element a drag source carrying `type` data to {@link useDropTarget}s of the same type. */
export function useDraggable<T>({
  type,
  getData,
  getExternalData,
  renderPreview,
  disabled = false,
}: UseDraggableOptions<T>): UseDraggableReturn {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const latest = useLatestRef({ getData, getExternalData, renderPreview });
  const { preview, onGenerateDragPreview } = useNativeDragPreview(
    () => latest.current.renderPreview?.() ?? null,
  );
  const customPreview = renderPreview !== undefined;
  const external = getExternalData !== undefined;

  useEffect(() => {
    if (!element || disabled) return;
    const key = keyOf(type);
    const cleanup = draggable({
      element,
      getInitialData: () => ({ [key]: latest.current.getData() }),
      getInitialDataForExternal: external
        ? () => latest.current.getExternalData?.() ?? {}
        : undefined,
      onGenerateDragPreview: customPreview ? onGenerateDragPreview : undefined,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    return () => {
      cleanup();
      setIsDragging(false);
    };
  }, [element, disabled, type, latest, external, customPreview, onGenerateDragPreview]);

  return { ref: setElement, isDragging: isDragging && !disabled, preview };
}

export interface UseDropTargetOptions<T> {
  type: DragType<T>;
  /** Whether this target takes the drag; one that doesn't stays out of it entirely. */
  canDrop?: (data: T) => boolean;
  onDrop: (data: T) => void;
  /** @default false */
  disabled?: boolean;
}

export interface UseDropTargetReturn {
  /** Attach to the element that takes drops. */
  ref: (element: HTMLElement | null) => void;
  /** A drag it would take is over it. */
  isOver: boolean;
}

/**
 * Makes an element take drops of `type` from {@link useDraggable}. Nested targets that both
 * take a drag each receive it, innermost first.
 */
export function useDropTarget<T>({
  type,
  canDrop,
  onDrop,
  disabled = false,
}: UseDropTargetOptions<T>): UseDropTargetReturn {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const latest = useLatestRef({ canDrop, onDrop });

  useEffect(() => {
    if (!element || disabled) return;
    const key = keyOf(type);
    const read = (data: Record<string | symbol, unknown>) => data[key] as T;
    const cleanup = dropTargetForElements({
      element,
      canDrop: ({ source }) =>
        key in source.data && (latest.current.canDrop?.(read(source.data)) ?? true),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        latest.current.onDrop(read(source.data));
      },
    });
    return () => {
      cleanup();
      setIsOver(false);
    };
  }, [element, disabled, type, latest]);

  return { ref: setElement, isOver: isOver && !disabled };
}
