import { Tooltip, useLatestRef } from "@construkt-kit/ui";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { resolveTooltip } from "../core/columns/cellSpec";
import { GRID_CHANNELS } from "../core/grid";
import { cellAt } from "./dom";
import type { AnyGridCore } from "./useGridCore";

const OPEN_DELAY = 500;

interface TooltipState {
  open: boolean;
  rect: DOMRect | null;
  content: ReactNode;
}

const CLOSED: TooltipState = { open: false, rect: null, content: null };

export function useCellTooltip(core: AnyGridCore) {
  const [state, setState] = useState<TooltipState>(CLOSED);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const target = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    target.current = null;
    setState((current) => (current.open ? { ...current, open: false } : current));
  }, []);

  useEffect(() => core.channels.subscribe(GRID_CHANNELS.scroll, close), [core, close]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback(
    (eventTarget: EventTarget | null, delay: number) => {
      const cell = cellAt(eventTarget);
      if (cell && cell.element === target.current) return;
      close();
      if (!cell || cell.row >= core.rowCount || cell.column >= core.columns.leaves.length) return;
      const { spec, ctx } = core.resolveCell(cell.row, cell.column);
      const content = resolveTooltip(spec, ctx);
      if (content == null || content === false || content === "") return;
      target.current = cell.element;
      timer.current = setTimeout(() => {
        if (target.current !== cell.element || !cell.element.isConnected) return;
        setState({ open: true, rect: cell.element.getBoundingClientRect(), content });
      }, delay);
    },
    [core, close],
  );

  return {
    onPointerOver: (event: { target: EventTarget | null }) => show(event.target, OPEN_DELAY),
    onPointerLeave: close,
    onFocus: (event: { target: EventTarget | null }) => show(event.target, 0),
    onBlur: close,
    tooltip: (
      <SharedTooltip
        state={state}
        onClose={close}
      />
    ),
  };
}

function SharedTooltip({ state, onClose }: { state: TooltipState; onClose: () => void }) {
  const rectRef = useLatestRef(state.rect);

  return (
    <Tooltip.Root
      open={state.open}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      positioning={{ placement: "top", getAnchorRect: () => rectRef.current }}
    >
      <Tooltip.Context>
        {(api) => (
          <Reposition
            rect={state.rect}
            reposition={api.reposition}
          />
        )}
      </Tooltip.Context>
      <Tooltip.Content>{state.content}</Tooltip.Content>
    </Tooltip.Root>
  );
}

function Reposition({ rect, reposition }: { rect: DOMRect | null; reposition: () => void }) {
  const repositionRef = useLatestRef(reposition);
  useEffect(() => {
    if (rect) repositionRef.current();
  }, [rect, repositionRef]);
  return null;
}
