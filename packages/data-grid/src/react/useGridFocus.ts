import { type FocusEvent, type MouseEvent, useCallback, useLayoutEffect, useRef } from "react";

import { GRID_CHANNELS } from "../core/grid";
import { cellAt, cellElement, controlAt, localPoint } from "./dom";
import type { AnyGridCore } from "./useGridCore";

export function useGridFocus(core: AnyGridCore, scroller: HTMLElement | null) {
  const focusWithin = useRef(false);
  const wasEditing = useRef(false);
  const keyboardInput = useRef(false);

  const activeCellElement = useCallback(() => {
    const active = core.activePosition();
    return active && cellElement(scroller, active);
  }, [core, scroller]);

  const focusActiveCell = useCallback(
    (options?: { focusVisible: boolean }) => {
      const cell = activeCellElement();
      if (cell && !cell.contains(document.activeElement)) {
        // Firefox keeps script focus invisible after a click, even once keys move it.
        const visible = keyboardInput.current ? { focusVisible: true } : {};
        cell.focus({ preventScroll: true, ...visible, ...options });
      }
    },
    [activeCellElement],
  );

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
      if (!focused || focused === document.body || scroller?.contains(focused)) {
        focusActiveCell();
      }
    }
    wasEditing.current = editing;
  }, [core, editingVersion, focusActiveCell, scroller]);

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    focusWithin.current = true;
    const cell = cellAt(event.target);
    if (cell) core.setActiveCell(cell, { reveal: false });
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    if (!event.target.isConnected) return;
    focusWithin.current = false;
    keyboardInput.current = false;
  };

  const onKeyDown = () => {
    keyboardInput.current = true;
  };

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    keyboardInput.current = false;
    const { target, currentTarget } = event;
    // React bubbles presses in portalled content (a cell's popover) through the grid.
    if (event.button === 1 || !(target instanceof Element) || !currentTarget.contains(target)) {
      return;
    }
    if (target === currentTarget) {
      const { x, y } = localPoint(currentTarget, event.clientX, event.clientY);
      if (x >= currentTarget.clientWidth || y >= currentTarget.clientHeight) return;
    }
    if (controlAt(target, currentTarget)) return;
    event.preventDefault();
    const cell = cellAt(target);
    if (cell && !event.shiftKey) core.setActiveCell(cell, { reveal: false });
    const active = activeCellElement();
    if (active && active !== document.activeElement) {
      active.focus({ preventScroll: true, focusVisible: false });
    }
  };

  return { focusActiveCell, onFocus, onBlur, onKeyDown, onMouseDown };
}
