import { useLatestRef } from "@construkt-kit/ui";
import {
  type RefObject,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  cellElement,
  clientRect,
  headerSelector,
  hitAt,
  naturalWidths,
  resizeHandleSelector,
} from "./dom";
import type { DataGridApi, DataGridOwnProps } from "./types";
import { writeClipboard } from "./useClipboard";
import type { AnyGridCore } from "./useGridCore";

interface GridApiOptions extends Pick<DataGridOwnProps<unknown>, "commands" | "apiRef"> {
  scroller: HTMLElement | null;
  rootRef: RefObject<HTMLElement | null>;
}

export function useGridApi(
  core: AnyGridCore,
  { scroller, rootRef, commands, apiRef }: GridApiOptions,
) {
  const apiHolder = useRef<DataGridApi | null>(null);
  const latestCommands = useLatestRef(commands);

  useLayoutEffect(
    () =>
      core.commands.intercept((name) => {
        const handler = latestCommands.current?.[name];
        const api = apiHolder.current;
        if (!handler || !api) return false;
        return (
          handler({ api, activeCell: core.activeAddress(), ...core.selection.details }) !== false
        );
      }),
    [core, latestCommands],
  );

  const autosize = useCallback(
    (columnIds?: readonly string[]) => {
      const root = rootRef.current;
      if (!root) return;
      const ids = columnIds
        ? columnIds.flatMap((id) => core.columns.leafIdsUnder(id))
        : core.columns.leaves.map((leaf) => leaf.id);
      const widths: Record<string, number> = {};
      for (const id of ids) {
        const index = core.columns.indexOf(id);
        if (index < 0) continue;
        const cells = root.querySelectorAll<HTMLElement>(
          `${headerSelector(id)}, [data-col-index="${index}"]:not([data-full-width], [aria-colspan])`,
        );
        const natural = Math.max(0, ...naturalWidths(Array.from(cells)));
        if (natural > 0) widths[id] = natural;
      }
      core.setColumnWidths(widths);
    },
    [core, rootRef],
  );

  const api = useMemo<DataGridApi>(
    () => ({
      scrollToCell: (cell) => {
        const position = core.positionOf(cell);
        if (position) core.scrollToCell(position);
      },
      getCellRect: (cell) => {
        const position = core.positionOf(cell);
        return (position && cellElement(scroller, position)?.getBoundingClientRect()) ?? null;
      },
      runCommand: (name) => core.runCommand(name),
      getState: () => core.getState(),
      restoreState: (state) => core.restoreState(state),
      autosizeColumns: (columnIds) => autosize(columnIds),
      resetColumnWidth: (columnId) => core.resetColumnWidth(columnId),
      setColumnHidden: (columnId, hidden) => core.setColumnHidden(columnId, hidden),
      setColumnPinned: (columnId, side) => core.setColumnPinned(columnId, side),
      setRowExpanded: (rowId, expanded) => core.setRowExpanded(rowId, expanded),
      resetRowHeight: (rowId) => core.resetRowHeight(rowId),
      copy: () => writeClipboard(core),
      getRangeRect: (range) => {
        const [rect] = core.selection.rangeRects([range]);
        return rect && scroller ? clientRect(scroller, core.viewportBox(rect)) : null;
      },
      flash: (targets) => core.flash(targets),
      startColumnResize: (columnId) => {
        const last = core.columns.visibleLeavesUnder(columnId).at(-1);
        if (!last || !scroller) return;
        core.scrollToCell({ row: core.activePosition()?.row ?? -1, column: last.index });
        requestAnimationFrame(() =>
          scroller
            .querySelector<HTMLElement>(resizeHandleSelector(columnId))
            ?.focus({ preventScroll: true }),
        );
      },
      hitTest: (clientX, clientY) => hitAt(core, scroller, clientX, clientY),
      editCell: (cell) => {
        const position = core.positionOf(cell);
        return position !== null && core.editing.startCell(position);
      },
      renameHeader: (columnId) => core.editing.startHeader(columnId),
    }),
    [core, scroller, autosize],
  );
  useLayoutEffect(() => {
    apiHolder.current = api;
  }, [api]);
  useLayoutEffect(() => {
    core.commands.register("resizeColumn", () => {
      const active = core.activeAddress();
      if (!active) return false;
      api.startColumnResize(active.columnId);
      return true;
    });
  }, [core, api]);
  useImperativeHandle(apiRef, () => api, [api]);

  return autosize;
}
