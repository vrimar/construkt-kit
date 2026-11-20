import type { CSSProperties, RefObject } from "react";

import { GRID_CHANNELS } from "../core/grid";
import { REGIONS, columnEdgeX, regionProps, spanGeometry } from "./geometry";
import type { DataGridClasses } from "./recipe";
import { type AnyGridCore, useChannels } from "./useGridCore";

const INDICATOR_CHANNELS = [GRID_CHANNELS.indicator];

interface IndicatorProps {
  core: AnyGridCore;
  classes: DataGridClasses;
}

export function RowDropMarker({ core, classes }: IndicatorProps) {
  useChannels(core, INDICATOR_CHANNELS);
  const indicator = core.dnd.indicator;
  if (indicator?.kind !== "rows") return null;
  const index = core.rowModel.indexOf(indicator.id);
  if (index < 0) return null;
  const top = core.rowTop(index);
  const { position } = indicator;
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
    <div
      className={classes.dropLayer}
      aria-hidden="true"
    >
      {REGIONS.map((region) => (
        <div
          key={region}
          {...regionProps(classes, region)}
        >
          {region === cell.region && (
            <div
              className={classes.dropIndicator}
              data-axis="columns"
              data-position={position}
              style={{ ...style, top, height: core.viewport.height - top }}
            />
          )}
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
