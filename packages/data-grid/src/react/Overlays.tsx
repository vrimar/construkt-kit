import { usePointerDrag } from "@construkt-kit/ui";
import { type PointerEventHandler, useEffect, useRef } from "react";

import type { Region } from "../core/columns/columnModel";
import type { CellTone } from "../core/columns/types";
import { FLASH_MS, type Flash } from "../core/flash";
import { GRID_CHANNELS } from "../core/grid";
import type { CellPosition } from "../core/selection/navigation";
import { type IndexRect, rectBetween } from "../core/selection/ranges";
import { cellUnder } from "./dom";
import { REGIONS, regionProps, spanGeometry } from "./geometry";
import type { DataGridClasses } from "./recipe";
import { type AnyGridCore, useChannels } from "./useGridCore";

const WINDOW_MARGIN = 1;

interface OverlaysProps {
  core: AnyGridCore;
  classes: DataGridClasses;
}

const OVERLAY_CHANNELS = [GRID_CHANNELS.ranges, GRID_CHANNELS.flash, GRID_CHANNELS.active];

export function Overlays({ core, classes }: OverlaysProps) {
  useChannels(core, OVERLAY_CHANNELS);
  const flashes = core.flashes;
  useFlashTimers(core, flashes);
  const onHandleDown = useRangeHandleDrag(core);

  if (core.rowCount === 0 || core.columns.leaves.length === 0) return null;
  const rects = core.selection.rangeRects();
  const handleRect = handleRectOf(core);

  return (
    <>
      {rects.map((rect, index) => (
        <OverlayBox
          key={`range-${index}`}
          core={core}
          classes={classes}
          rect={rect}
          kind="range"
        />
      ))}
      {flashes.flatMap((flash) =>
        flashRects(core, flash).map((rect, index) => (
          <OverlayBox
            key={`flash-${flash.id}-${index}`}
            core={core}
            classes={classes}
            rect={rect}
            kind="flash"
            tone={flash.kind}
          />
        )),
      )}
      {handleRect && (
        <OverlayBox
          core={core}
          classes={classes}
          rect={handleRect}
          kind="handles"
          onHandleDown={onHandleDown}
        />
      )}
    </>
  );
}

function useFlashTimers(core: AnyGridCore, flashes: readonly Flash[]) {
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const armed = timers.current;
    for (const { id } of flashes) {
      if (armed.has(id)) continue;
      const dismiss = () => {
        armed.delete(id);
        core.dismissFlash(id);
      };
      armed.set(id, setTimeout(dismiss, FLASH_MS));
    }
  }, [core, flashes]);
  useEffect(() => {
    const armed = timers.current;
    return () => {
      for (const timer of armed.values()) clearTimeout(timer);
      armed.clear();
    };
  }, []);
}

function useRangeHandleDrag(core: AnyGridCore) {
  const fixed = useRef<CellPosition | null>(null);
  const { onPointerDown } = usePointerDrag<HTMLDivElement>({
    onPress: (event) => {
      const corner = event.target instanceof Element ? event.target.closest("[data-corner]") : null;
      const rect = handleRectOf(core);
      if (!corner || !rect) return false;
      event.stopPropagation();
      fixed.current =
        corner.getAttribute("data-corner") === "start"
          ? { row: rect.bottom, column: rect.right }
          : { row: rect.top, column: rect.left };
    },
    onMove: ({ clientX, clientY }) => {
      const cell = cellUnder(clientX, clientY);
      if (cell && fixed.current) core.selection.dragHandle(fixed.current, cell);
    },
    onEnd: (_, { cancelled }) => core.selection.releaseDrag(cancelled),
  });
  return onPointerDown;
}

const handleRectOf = (core: AnyGridCore): IndexRect | null => {
  const active = core.activePosition();
  return core.selection.rangeRects().at(-1) ?? (active && rectBetween(active, active));
};

function flashRects(core: AnyGridCore, flash: Flash): IndexRect[] {
  const lastColumn = core.columns.leaves.length - 1;
  const { start, end } = core.rowWindowRange;
  const rects: IndexRect[] = [];
  for (const id of flash.rows) {
    const row = core.rowModel.indexOf(id);
    if (row >= 0) rects.push({ top: row, bottom: row, left: 0, right: lastColumn });
  }
  for (const id of flash.columns) {
    const column = core.columns.indexOf(id);
    if (column >= 0)
      rects.push({ top: start, bottom: Math.max(start, end - 1), left: column, right: column });
  }
  for (const cell of flash.cells) {
    const position = core.positionOf(cell);
    if (position) rects.push(rectBetween(position, position));
  }
  return rects;
}

interface OverlayBoxProps {
  core: AnyGridCore;
  classes: DataGridClasses;
  rect: IndexRect;
  kind: "range" | "flash" | "handles";
  tone?: CellTone;
  // On the row, not a handle: a handle remounts when its corner changes region, ending a touch drag.
  onHandleDown?: PointerEventHandler<HTMLDivElement>;
}

function OverlayBox({ core, classes, rect, kind, tone, onHandleDown }: OverlayBoxProps) {
  const { start, end } = core.rowWindowRange;
  const top = Math.max(rect.top, start - WINDOW_MARGIN);
  const bottom = Math.min(rect.bottom, end + WINDOW_MARGIN);
  if (bottom < top) return null;
  const { leaves, centerStart, centerEnd } = core.columns;
  const bounds: Record<Region, readonly [number, number]> = {
    left: [0, centerStart],
    center: [centerStart, centerEnd],
    right: [centerEnd, leaves.length],
  };
  const parts = REGIONS.map((region) => {
    const first = Math.max(rect.left, bounds[region][0]);
    const last = Math.min(rect.right, bounds[region][1] - 1);
    return first <= last ? { region, first, last } : null;
  });
  const present = parts.filter((part) => part !== null);
  const firstRegion = present[0]?.region;
  const lastRegion = present.at(-1)?.region;

  return (
    <div
      className={classes.overlayRow}
      aria-hidden="true"
      style={{ top: core.rowTop(top), height: core.rowsHeight(top, bottom - top + 1) }}
      onPointerDown={onHandleDown}
    >
      {REGIONS.map((region, index) => {
        const part = parts[index];
        return (
          <div
            key={region}
            {...regionProps(classes, region)}
          >
            {part && (
              <div
                className={classes.overlay}
                data-kind={kind}
                data-tone={tone}
                data-open-start={region !== firstRegion || undefined}
                data-open-end={region !== lastRegion || undefined}
                data-open-top={top > rect.top || undefined}
                data-open-bottom={bottom < rect.bottom || undefined}
                style={spanGeometry(part.first, part.last)}
              >
                {kind === "handles" && region === firstRegion && top === rect.top && (
                  <span
                    className={classes.rangeHandle}
                    data-corner="start"
                  />
                )}
                {kind === "handles" && region === lastRegion && bottom === rect.bottom && (
                  <span
                    className={classes.rangeHandle}
                    data-corner="end"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
