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
  useLayoutEffect,
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
import type { RowId } from "../core/rows/rowNode";
import { clientRect, localPoint } from "./dom";
import { ariaRows } from "./geometry";
import { SELECTION_COLUMN_ID } from "./selectionColumn";
import type { DataGridLabels, DataGridOwnProps, GridHit } from "./types";
import type { AnyGridCore } from "./useGridCore";

export function hitAt(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  clientX: number,
  clientY: number,
): GridHit | null {
  if (!scroller) return null;
  core.setScroll(scroller.scrollTop, scroller.scrollLeft);
  const { x, y } = localPoint(scroller, clientX, clientY);
  const hit = core.hitTest(x, y);
  if (!hit) return null;
  const { region, rowId, columnId, headerId, fractionX, fractionY, box } = hit;
  return {
    region,
    rowId,
    columnId,
    headerId,
    fractionX,
    fractionY,
    rect: clientRect(scroller, box),
  };
}

function dragLabel(core: AnyGridCore, source: DragSource, labels: DataGridLabels): string {
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

function movedIndex(core: AnyGridCore, source: DragSource): number {
  const [id] = source.ids;
  if (source.kind === "rows") return core.rowModel.indexOf(id);
  return core.columns.headerCell(String(id))?.first ?? -1;
}

interface GripDropOptions<TRow> extends Pick<
  DataGridOwnProps<TRow>,
  "rows" | "columnDefs" | "onRowsDrop" | "onColumnsDrop"
> {
  coreRef: RefObject<AnyGridCore | null>;
  scroller: HTMLElement | null;
  handleClassName: string;
  labels: Readonly<RefObject<DataGridLabels>>;
  announce: (message: string) => void;
}

interface PendingMove {
  source: DragSource;
  from: number;
  input: unknown;
}

export function useGripDrop<TRow>({
  coreRef,
  scroller,
  handleClassName,
  labels,
  announce,
  rows,
  columnDefs,
  onRowsDrop,
  onColumnsDrop,
}: GripDropOptions<TRow>) {
  const item = useRef<DragItem | null>(null);
  const releasePoint = useRef<{ x: number; y: number } | null>(null);
  const pendingMove = useRef<PendingMove | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ label: string; kind: DragItem["kind"] } | null>(null);
  const latest = useLatestRef({ rows, columnDefs, onRowsDrop, onColumnsDrop });

  const follow = (core: AnyGridCore, clientX: number, clientY: number) => {
    if (scroller) {
      const { x, y } = localPoint(scroller, clientX, clientY);
      core.setScroll(scroller.scrollTop, scroller.scrollLeft);
      core.dnd.hover(x, y);
    }
    ghostRef.current?.style.setProperty("translate", `${clientX}px ${clientY}px`);
  };

  const { onPointerDown } = usePointerDrag<HTMLElement>({
    threshold: 4,
    onPress: () => item.current !== null,
    onStart: ({ clientX, clientY }) => {
      const core = coreRef.current;
      const next = item.current;
      if (!core || !next || !core.dnd.begin(next)) return;
      const source = core.dnd.source;
      if (source) {
        setGhost({ label: dragLabel(core, source, labels.current), kind: next.kind });
      }
      follow(core, clientX, clientY);
    },
    onMove: ({ clientX, clientY }) => {
      if (coreRef.current) follow(coreRef.current, clientX, clientY);
    },
    onEnd: ({ clientX, clientY }, { cancelled }) => {
      releasePoint.current = { x: clientX, y: clientY };
      coreRef.current?.dnd.end(cancelled);
      releasePoint.current = null;
      item.current = null;
      setGhost(null);
    },
    autoScroll: {
      element: scroller,
      inset: () => coreRef.current?.scrollInset ?? {},
      axis: ghost?.kind === "columns" ? "x" : "y",
    },
  });

  const dragHandles = useMemo<DragHandles>(
    () => ({
      className: handleClassName,
      press: (next, event) => {
        event.stopPropagation();
        item.current = next;
        onPointerDown(event as unknown as ReactPointerEvent<HTMLElement>);
      },
    }),
    [handleClassName, onPointerDown],
  );

  const rowsDrop = useCallback(
    (drop: CoreRowsDrop) => {
      const core = coreRef.current;
      latest.current.onRowsDrop?.({
        ...drop,
        rect: core && rowRect(core, scroller, drop.targetId),
        point: releasePoint.current,
      });
    },
    [coreRef, scroller, latest],
  );
  const columnsDrop = useCallback(
    (drop: CoreColumnsDrop) => {
      const core = coreRef.current;
      latest.current.onColumnsDrop?.({
        ...drop,
        rect: core && headerRect(core, scroller, drop.targetId),
        point: releasePoint.current,
      });
    },
    [coreRef, scroller, latest],
  );
  const onKeyboardMove = useCallback(
    (source: DragSource) => {
      const core = coreRef.current;
      pendingMove.current = {
        source,
        from: core ? movedIndex(core, source) : -1,
        input: source.kind === "rows" ? latest.current.rows : latest.current.columnDefs,
      };
    },
    [coreRef, latest],
  );

  useLayoutEffect(() => {
    const move = pendingMove.current;
    const core = coreRef.current;
    if (!move || !core || move.input === (move.source.kind === "rows" ? rows : columnDefs)) return;
    pendingMove.current = null;
    const index = movedIndex(core, move.source);
    if (index < 0 || index === move.from) return;
    const aria = ariaRows(core);
    announce(
      move.source.kind === "rows"
        ? labels.current.rowMoved(aria.body + index, aria.count)
        : labels.current.columnMoved(index + 1, core.columns.leaves.length),
    );
    const active = core.activePosition();
    if (active) core.scrollToCell(active);
  });

  return {
    options: {
      dragHandles,
      onRowsDrop: onRowsDrop && rowsDrop,
      onColumnsDrop: onColumnsDrop && columnsDrop,
      onKeyboardMove,
    },
    ghost,
    ghostRef,
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
