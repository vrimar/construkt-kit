import { useTooltipDelegate } from "@construkt-kit/ui";
import { useCallback, useEffect, useRef } from "react";

import { resolveTooltip } from "../core/columns/cellSpec";
import { GRID_CHANNELS } from "../core/grid";
import { CELL_TOOLTIP_OPEN_DELAY } from "./cellTooltipDelay";
import { cellAt } from "./dom";
import type { AnyGridCore } from "./useGridCore";

export function useCellTooltip(core: AnyGridCore) {
  const { show, showAfterDelay, hide, tooltip } = useTooltipDelegate({
    openDelay: CELL_TOOLTIP_OPEN_DELAY,
  });
  const target = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    target.current = null;
    hide();
  }, [hide]);

  useEffect(() => core.channels.subscribe(GRID_CHANNELS.scroll, close), [core, close]);

  const open = (eventTarget: EventTarget | null, delayed: boolean) => {
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
    if (delayed) showAfterDelay(cell.element, content);
    else show(cell.element, content);
  };

  return {
    onPointerOver: (event: { target: EventTarget | null }) => open(event.target, true),
    onPointerLeave: close,
    onFocus: (event: { target: EventTarget | null }) => {
      const cell = cellAt(event.target);
      if (cell?.element === event.target && cell.element.matches(":focus-visible"))
        open(cell.element, false);
    },
    onBlur: close,
    tooltip,
  };
}
