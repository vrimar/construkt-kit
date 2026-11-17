import type { CSSProperties } from "react";

import type { Region } from "../core/columns/columnModel";
import { REGIONS, regionProps, spanGeometry } from "./geometry";
import type { DataGridClasses } from "./recipe";
import type { GridOutline } from "./types";
import type { AnyGridCore } from "./useGridCore";

interface OutlinesProps {
  core: AnyGridCore;
  classes: DataGridClasses;
  outlines: readonly GridOutline[];
}

export function RowOutlines({ core, classes, outlines }: OutlinesProps) {
  return outlines.map((outline, key) => {
    if (outline.kind !== "rows") return null;
    const indexes = outline.ids
      .map((id) => core.rowModel.indexOf(id))
      .filter((index) => index >= 0);
    if (indexes.length === 0) return null;
    const first = Math.min(...indexes);
    const end = core.rowModel.subtreeEnd(Math.max(...indexes));
    return (
      <div
        key={key}
        className={classes.outline}
        aria-hidden="true"
        data-axis="rows"
        style={{ top: core.rowTop(first), height: core.rowsHeight(first, end - first) }}
      />
    );
  });
}

export function ColumnOutlines({ core, classes, outlines }: OutlinesProps) {
  const contentBottom = Math.min(
    core.viewport.height,
    core.bodyTop + core.bodyScrollHeight + core.pinnedBottomHeight,
  );
  const boxes = outlines.flatMap((outline): { region: Region; style: CSSProperties }[] => {
    if (outline.kind !== "columns") return [];
    const cells = outline.ids.flatMap((id) => core.columns.headerCell(id) ?? []);
    const region = cells[0]?.region;
    const span = cells.filter((cell) => cell.region === region);
    if (!region || span.length === 0) return [];
    const top = core.headerLevels[Math.min(...span.map((cell) => cell.level))]?.top ?? 0;
    return [
      {
        region,
        style: {
          ...spanGeometry(
            Math.min(...span.map((cell) => cell.first)),
            Math.max(...span.map((cell) => cell.last)),
          ),
          top,
          height: Math.max(0, contentBottom - top),
        },
      },
    ];
  });
  if (boxes.length === 0) return null;
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
          {boxes.map(
            (box, key) =>
              box.region === region && (
                <div
                  key={key}
                  className={classes.outline}
                  data-axis="columns"
                  style={box.style}
                />
              ),
          )}
        </div>
      ))}
    </div>
  );
}
