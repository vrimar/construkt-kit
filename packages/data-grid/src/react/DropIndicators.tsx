import type { CSSProperties, ReactNode, RefObject } from "react";

import type { Region } from "../core/columns/columnModel";
import { GRID_CHANNELS } from "../core/grid";
import { REGIONS, columnEdgeX, regionProps, spanGeometry } from "./geometry";
import type { DataGridClasses } from "./recipe";
import { type AnyGridCore, useChannels } from "./useGridCore";

const INDICATOR_CHANNELS = [GRID_CHANNELS.indicator];
const ROW_INDICATOR_CHANNELS = [GRID_CHANNELS.indicator, GRID_CHANNELS.sticky];

interface IndicatorProps {
  core: AnyGridCore;
  classes: DataGridClasses;
}

export function RowDropMarker({
  core,
  classes,
  stuck = false,
}: IndicatorProps & { stuck?: boolean }) {
  useChannels(core, ROW_INDICATOR_CHANNELS);
  const indicator = core.dnd.indicator;
  if (indicator?.kind !== "rows") return null;
  const index = core.rowModel.indexOf(indicator.id);
  if (index < 0) return null;
  const { position } = indicator;
  const stuckRow =
    position === "after" ? undefined : core.stickyRows.find((row) => row.index === index);
  if (stuck !== (stuckRow !== undefined)) return null;
  const top = stuckRow?.top ?? core.rowTop(index);
  const end = core.rowModel.subtreeEnd(index);
  const style: CSSProperties =
    position === "onto"
      ? { top, height: core.rowHeight(index) }
      : { top: position === "before" ? top : top + core.rowsHeight(index, end - index) };
  return (
    <div
      className={classes.dropIndicator}
      aria-hidden="true"
      data-axis="rows"
      data-position={position}
      style={style}
    />
  );
}

export function ColumnDropLayer({ core, classes }: IndicatorProps) {
  useChannels(core, INDICATOR_CHANNELS);
  const indicator = core.dnd.indicator;
  if (indicator?.kind !== "columns") return null;
  const cell = core.columns.headerCell(indicator.id);
  if (!cell) return null;
  const { position } = indicator;
  const { top } = core.headerBox(cell);
  const style: CSSProperties =
    position === "onto"
      ? spanGeometry(cell.first, cell.last)
      : {
          left:
            position === "before"
              ? columnEdgeX(cell.first, "start")
              : columnEdgeX(cell.last, "end"),
        };
  return (
    <ColumnLayer classes={classes}>
      {(region) =>
        region === cell.region && (
          <div
            className={classes.dropIndicator}
            data-axis="columns"
            data-position={position}
            style={{ ...style, top, height: core.viewport.height - top }}
          />
        )
      }
    </ColumnLayer>
  );
}

export function ColumnLayer({
  classes,
  children,
}: {
  classes: DataGridClasses;
  children: (region: Region) => ReactNode;
}) {
  return (
    <div
      className={classes.dropLayer}
      aria-hidden="true"
    >
      {REGIONS.map((region) => (
        <div
          key={region}
          {...regionProps(classes, region)}
        >
          {children(region)}
        </div>
      ))}
    </div>
  );
}

export function DragGhost({
  classes,
  label,
  ghostRef,
}: {
  classes: DataGridClasses;
  label: string | null;
  ghostRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={ghostRef}
      className={classes.dragGhost}
      aria-hidden="true"
      hidden={label === null}
    >
      {label}
    </div>
  );
}
