import {
  type EdgeAutoScroll,
  createEdgeAutoScroll,
  useLatestRef,
  usePointerDrag,
} from "@construkt-kit/ui";
import {
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { headerText } from "../core/columns/columnModel";
import type {
  ColumnsDrop as CoreColumnsDrop,
  DragHandles,
  DragItem,
  DragSource,
  RowsDrop as CoreRowsDrop,
} from "../core/dnd/types";
import type { CoreHit } from "../core/layout/hit";
import type { RowId } from "../core/rows/rowNode";
import { clientRect, coveredAt, gridHit, gridPoint, hitAt } from "./dom";
import { SELECTION_COLUMN_ID } from "./selectionColumn";
import type { DataGridLabels, DataGridOwnProps } from "./types";
import type { AnyGridCore } from "./useGridCore";

function defaultDragLabel(core: AnyGridCore, source: DragSource, labels: DataGridLabels): string {
  if (source.ids.length > 1) return labels.dragging(source.ids.length);
  const id = source.ids[0];
  if (source.kind === "columns") {
    const cell = core.columns.headerCell(String(id));
    return cell ? headerText(cell.def) : String(id);
  }
  const row = core.rowModel.indexOf(id);
  const { leaves } = core.columns;
  const column =
    leaves.find((leaf) => leaf.def.rowHeader) ??
    leaves.find((leaf) => leaf.id !== SELECTION_COLUMN_ID);
  return row >= 0 && column ? core.resolveCell(row, column.index).ctx.formattedValue : String(id);
}

function rowRect(core: AnyGridCore, scroller: HTMLElement | null, rowId: RowId): DOMRect | null {
  const row = core.rowModel.indexOf(rowId);
  if (!scroller || row < 0 || core.columns.leaves.length === 0) return null;
  const { top, height } = core.viewportBox({ top: row, bottom: row, left: 0, right: 0 });
  return clientRect(scroller, { left: 0, top, width: scroller.clientWidth, height });
}

function headerRect(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  columnId: string,
): DOMRect | null {
  const cell = core.columns.headerCell(columnId);
  return scroller && cell ? clientRect(scroller, core.headerBox(cell)) : null;
}

interface GripDropOptions<TRow> extends Pick<
  DataGridOwnProps<TRow>,
  "onRowsDrop" | "onColumnsDrop" | "onDragMove" | "canDropAcross" | "onDropAcross" | "dragLabel"
> {
  scroller: HTMLElement | null;
  handleClassName: string;
  labels: Readonly<RefObject<DataGridLabels>>;
}

export function useGripDrop<TRow>(
  core: AnyGridCore,
  {
    scroller,
    handleClassName,
    labels,
    onRowsDrop,
    onColumnsDrop,
    onDragMove,
    canDropAcross,
    onDropAcross,
    dragLabel,
  }: GripDropOptions<TRow>,
) {
  const item = useRef<DragItem | null>(null);
  const offered = useRef<DragItem | null>(null);
  const releasePoint = useRef<{ x: number; y: number } | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ label: string; kind: DragItem["kind"] } | null>(null);
  const [across, setAcross] = useState<"allowed" | "refused" | null>(null);
  const latest = useLatestRef({
    onRowsDrop,
    onColumnsDrop,
    onDragMove,
    canDropAcross,
    onDropAcross,
    dragLabel,
  });

  const follow = (clientX: number, clientY: number) => {
    if (scroller) {
      const { x, y } = gridPoint(core, scroller, clientX, clientY);
      core.dnd.hover(x, y, coveredAt(scroller, clientX, clientY));
    }
    ghostRef.current?.style.setProperty("translate", `${clientX}px ${clientY}px`);
  };

  const report = (clientX: number, clientY: number) => {
    const source = core.dnd.source;
    if (!source) return;
    const over = core.dnd.across;
    setAcross(over && (over.allowed ? "allowed" : "refused"));
    const placement = core.dnd.placement;
    latest.current.onDragMove?.(source, {
      hit: hitAt(core, scroller, clientX, clientY),
      placement: placement && { ...placement },
      point: { x: clientX, y: clientY },
      across: over !== null,
      acrossAllowed: over?.allowed === true,
    });
  };

  const { onPointerDown } = usePointerDrag<HTMLElement>({
    threshold: 4,
    onPress: () => {
      item.current = offered.current;
      return item.current !== null;
    },
    onStart: ({ clientX, clientY }) => {
      const next = item.current;
      if (!next || !core.dnd.begin(next)) return;
      const source = core.dnd.source;
      if (source) {
        const label =
          latest.current.dragLabel?.(source) ?? defaultDragLabel(core, source, labels.current);
        setGhost({ label, kind: next.kind });
      }
      follow(clientX, clientY);
    },
    onMove: ({ clientX, clientY }) => {
      follow(clientX, clientY);
      report(clientX, clientY);
    },
    onEnd: ({ clientX, clientY }, { cancelled }) => {
      const source = core.dnd.source;
      if (source) latest.current.onDragMove?.(source, null);
      releasePoint.current = { x: clientX, y: clientY };
      core.dnd.end(cancelled);
      releasePoint.current = null;
      setGhost(null);
      setAcross(null);
    },
    onRelease: () => {
      item.current = null;
    },
    autoScroll: across
      ? undefined
      : {
          element: scroller,
          inset: () => core.scrollInset,
          axis: ghost?.kind === "columns" ? "x" : "y",
        },
  });

  const dragHandles = useMemo<DragHandles>(
    () => ({
      className: handleClassName,
      press: (next, event) => {
        event.stopPropagation();
        offered.current = next;
        onPointerDown(event as unknown as ReactPointerEvent<HTMLElement>);
        offered.current = null;
      },
    }),
    [handleClassName, onPointerDown],
  );

  const rowsDrop = useCallback(
    (drop: CoreRowsDrop) => {
      latest.current.onRowsDrop?.({
        ...drop,
        rect: rowRect(core, scroller, drop.targetId),
        point: releasePoint.current,
      });
    },
    [core, scroller, latest],
  );
  const columnsDrop = useCallback(
    (drop: CoreColumnsDrop) => {
      latest.current.onColumnsDrop?.({
        ...drop,
        rect: headerRect(core, scroller, drop.targetId),
        point: releasePoint.current,
      });
    },
    [core, scroller, latest],
  );
  const canDropAcrossAt = useCallback(
    (source: DragSource, hit: CoreHit) =>
      scroller !== null && latest.current.canDropAcross?.(source, gridHit(scroller, hit)) === true,
    [scroller, latest],
  );
  const dropAcross = useCallback(
    (source: DragSource, hit: CoreHit) => {
      const point = releasePoint.current;
      if (scroller && point) latest.current.onDropAcross?.(source, gridHit(scroller, hit), point);
    },
    [scroller, latest],
  );

  return {
    options: {
      dragHandles,
      onRowsDrop: onRowsDrop && rowsDrop,
      onColumnsDrop: onColumnsDrop && columnsDrop,
      canDropAcross: canDropAcross && canDropAcrossAt,
      onDropAcross: onDropAcross && dropAcross,
    },
    ghost,
    ghostRef,
    refused: across === "refused",
  };
}

export function useExternalDrop(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  options: Pick<
    DataGridOwnProps<unknown>,
    "onExternalDragOver" | "onExternalDrop" | "onExternalDragLeave"
  >,
) {
  const latest = useLatestRef(options);
  const pointer = useRef<{ clientX: number; clientY: number; types: readonly string[] } | null>(
    null,
  );
  const entered = useRef<EventTarget | null>(null);

  const evaluate = useCallback(
    (dataTransfer: DataTransfer | null) => {
      const last = pointer.current;
      if (!last) return false;
      const hit = hitAt(core, scroller, last.clientX, last.clientY);
      return latest.current.onExternalDragOver?.({ hit, types: last.types, dataTransfer }) === true;
    },
    [core, scroller, latest],
  );

  const autoScroll = useRef<EdgeAutoScroll | null>(null);
  useEffect(() => {
    const instance = createEdgeAutoScroll(
      { element: scroller, inset: () => core.scrollInset },
      () => evaluate(null),
    );
    autoScroll.current = instance;
    return () => instance.stop();
  }, [core, scroller, evaluate]);

  const stop = useCallback(() => {
    autoScroll.current?.stop();
    pointer.current = null;
    entered.current = null;
  }, []);

  useEffect(() => {
    const end = () => {
      if (!pointer.current) return;
      stop();
      latest.current.onExternalDragLeave?.();
    };
    document.addEventListener("dragend", end);
    return () => {
      document.removeEventListener("dragend", end);
      stop();
    };
  }, [latest, stop]);

  const enabled = options.onExternalDragOver !== undefined;
  const onDragOver = (event: DragEvent<HTMLElement>) => {
    pointer.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      types: Array.from(event.dataTransfer.types),
    };
    if (evaluate(event.dataTransfer)) event.preventDefault();
    autoScroll.current?.update(event.clientX, event.clientY);
  };
  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    entered.current = event.target;
  };
  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    // Older Safari leaves relatedTarget null; dragenter on the next element always fires first.
    const next = event.relatedTarget ?? (event.target === entered.current ? null : entered.current);
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    stop();
    latest.current.onExternalDragLeave?.();
  };
  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    stop();
    const hit = hitAt(core, scroller, event.clientX, event.clientY);
    latest.current.onExternalDrop?.({
      hit,
      types: Array.from(event.dataTransfer.types),
      dataTransfer: event.dataTransfer,
    });
  };
  return enabled ? { onDragEnter, onDragOver, onDragLeave, onDrop } : {};
}
