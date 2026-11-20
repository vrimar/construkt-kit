import { Tooltip } from "@construkt-kit/ui";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { resolveTooltip } from "../core/columns/cellSpec";
import { GRID_CHANNELS } from "../core/grid";
import { cellAt } from "./dom";
import type { AnyGridCore } from "./useGridCore";

const OPEN_DELAY = 500;

interface TooltipState {
  open: boolean;
  cell: HTMLElement | null;
  rect: DOMRect | null;
  content: ReactNode;
}

const CLOSED: TooltipState = { open: false, cell: null, rect: null, content: null };

class TooltipStore {
  private state = CLOSED;
  private readonly listeners = new Set<() => void>();

  readonly get = (): TooltipState => this.state;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  update(next: (current: TooltipState) => TooltipState): void {
    const state = next(this.state);
    if (state === this.state) return;
    this.state = state;
    for (const listener of [...this.listeners]) listener();
  }
}

export function useCellTooltip(core: AnyGridCore) {
  const [store] = useState(() => new TooltipStore());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const target = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    target.current = null;
    store.update((current) => (current.open ? { ...current, open: false } : current));
  }, [store]);

  useEffect(() => core.channels.subscribe(GRID_CHANNELS.scroll, close), [core, close]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback(
    (eventTarget: EventTarget | null, delay: number) => {
      const cell = cellAt(eventTarget);
      if (cell && cell.element === target.current) return;
      close();
      if (
        !cell ||
        cell.element.hasAttribute("data-editing") ||
        cell.row >= core.rowCount ||
        cell.column >= core.columns.leaves.length
      )
        return;
      const { spec, ctx } = core.resolveCell(cell.row, cell.column);
      const content = resolveTooltip(spec, ctx);
      if (content == null || content === false || content === "") return;
      target.current = cell.element;
      timer.current = setTimeout(() => {
        if (target.current !== cell.element || !cell.element.isConnected) return;
        const rect = cell.element.getBoundingClientRect();
        store.update(() => ({ open: true, cell: cell.element, rect, content }));
      }, delay);
    },
    [core, close, store],
  );

  return {
    onPointerOver: (event: { target: EventTarget | null }) => show(event.target, OPEN_DELAY),
    onPointerLeave: close,
    onFocus: (event: { target: EventTarget | null }) => {
      const cell = cellAt(event.target);
      if (cell?.element === event.target && cell.element.matches(":focus-visible"))
        show(cell.element, 0);
    },
    onBlur: close,
    tooltip: (
      <SharedTooltip
        store={store}
        onClose={close}
      />
    ),
  };
}

function SharedTooltip({ store, onClose }: { store: TooltipStore; onClose: () => void }) {
  const state = useSyncExternalStore(store.subscribe, store.get, store.get);
  const { open, cell, rect } = state;
  const anchor = useMemo(() => (rect ? { getBoundingClientRect: () => rect } : null), [rect]);

  useEffect(() => {
    if (!open || !cell) return;
    const onScroll = ({ target }: Event) => {
      if (target instanceof Document || (target instanceof Node && target.contains(cell)))
        onClose();
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [open, cell, onClose]);

  return (
    <Tooltip
      open={open}
      label={state.content}
      anchor={anchor}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      {null}
    </Tooltip>
  );
}
