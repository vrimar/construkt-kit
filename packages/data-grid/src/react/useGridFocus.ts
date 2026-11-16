import {
  type FocusEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";

import { GRID_CHANNELS } from "../core/grid";
import { FOCUSABLE, cellAt, cellSelector, localPoint } from "./dom";
import type { AnyGridCore } from "./useGridCore";

export function useGridFocus(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  rootRef: RefObject<HTMLElement | null>,
) {
  const focusWithin = useRef(false);
  const wasEditing = useRef(false);

  const activeCellElement = useCallback(() => {
    const active = core.activePosition();
    if (!active || !scroller) return null;
    return (
      scroller.querySelector<HTMLElement>(cellSelector(active.row, active.column)) ??
      scroller.querySelector<HTMLElement>(`[data-row-index="${active.row}"] [data-full-width]`)
    );
  }, [core, scroller]);

  const focusActiveCell = useCallback(() => {
    const cell = activeCellElement();
    if (cell && !cell.contains(document.activeElement)) cell.focus({ preventScroll: true });
  }, [activeCellElement]);

  const activeVersion = core.channels.version(GRID_CHANNELS.active);
  useLayoutEffect(() => {
    if (focusWithin.current && !core.editing.state) focusActiveCell();
  }, [core, activeVersion, focusActiveCell]);
  useLayoutEffect(() => {
    if (!focusWithin.current || core.editing.state) return;
    const focused = document.activeElement;
    if (!focused || focused === document.body) focusActiveCell();
  });

  const editingVersion = core.channels.version(GRID_CHANNELS.editing);
  useLayoutEffect(() => {
    const editing = core.editing.state !== null;
    if (wasEditing.current && !editing) {
      const focused = document.activeElement;
      if (!focused || focused === document.body || rootRef.current?.contains(focused)) {
        focusActiveCell();
      }
    }
    wasEditing.current = editing;
  }, [core, editingVersion, focusActiveCell, rootRef]);

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    focusWithin.current = true;
    const cell = cellAt(event.target);
    if (cell) core.setActiveCell(cell, { reveal: false });
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    if (event.target.isConnected) focusWithin.current = false;
  };

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    const { target, currentTarget } = event;
    // React bubbles presses in portalled content (a cell's popover) through the grid.
    if (event.button === 1 || !(target instanceof Element) || !currentTarget.contains(target)) {
      return;
    }
    if (target === currentTarget) {
      const { x, y } = localPoint(currentTarget, event.clientX, event.clientY);
      if (x >= currentTarget.clientWidth || y >= currentTarget.clientHeight) return;
    }
    const control = target.closest<HTMLElement>(FOCUSABLE);
    if (control && currentTarget.contains(control) && !control.hasAttribute("data-col-index")) {
      return;
    }
    event.preventDefault();
    const cell = cellAt(target);
    if (cell && !event.shiftKey) core.setActiveCell(cell, { reveal: false });
    const active = activeCellElement();
    if (active && active !== document.activeElement) {
      active.focus({ preventScroll: true, focusVisible: false });
    }
  };

  return { focusActiveCell, onFocus, onBlur, onMouseDown };
}
