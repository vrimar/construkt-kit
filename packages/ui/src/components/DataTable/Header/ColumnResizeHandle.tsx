import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { styled } from "#styled-system/jsx";

import { isRtl } from "../../../foundations/dom";
import { usePointerDrag } from "../../../hooks/usePointerDrag";
import { mirrorArrowKey } from "../../../primitives/composite";
import { useLocale } from "../../../primitives/locale";
import { MIN_RESIZED_COLUMN_WIDTH, columnTemplateVar, getColumnTemplate } from "../columnTemplate";
import { useDataTableContext } from "../context";
import type { DataTableHeader } from "../types";
import { getColumnLabel } from "./columnLabel";

const KEYBOARD_STEP = 16;

interface ColumnResizeHandleProps<TData extends object> {
  header: DataTableHeader<TData>;
  resizeColumn: (columnId: string, width: number | undefined) => void;
}

interface ResizeDrag {
  grid: HTMLElement;
  startWidth: number;
  floor: number;
  pxPerScreenPx: number;
  direction: number;
  committedTemplate: string;
  width: number;
}

export const ColumnResizeHandle = <TData extends object>({
  header,
  resizeColumn,
}: ColumnResizeHandleProps<TData>) => {
  const { columnSizing, gridRef, labels } = useDataTableContext<TData>();
  const { column } = header;
  const handleRef = useRef<HTMLSpanElement>(null);
  const [renderedWidth, setRenderedWidth] = useState<number>();
  const dragRef = useRef<ResizeDrag | null>(null);
  const rtl = useLocale().dir === "rtl";

  useLayoutEffect(() => {
    const cell = handleRef.current?.parentElement;
    if (!cell) return;
    const observer = new ResizeObserver(([entry]) => {
      const inlineSize = entry?.borderBoxSize[0]?.inlineSize;
      if (inlineSize !== undefined) setRenderedWidth(Math.round(inlineSize));
    });
    observer.observe(cell);
    return () => observer.disconnect();
  }, []);

  const minWidth = column.columnDef.meta?.minWidth ?? MIN_RESIZED_COLUMN_WIDTH;

  const { onPointerDown } = usePointerDrag<HTMLSpanElement>({
    claimPress: true,
    activeAttribute: "data-resizing",
    onPress: (event) => {
      const cell = event.currentTarget.parentElement;
      const grid = gridRef.current;
      if (!cell || !grid) return false;
      const startWidth = cell.offsetWidth;
      // clientX is in screen px, which a scaled ancestor makes differ from layout px.
      const screenWidth = cell.getBoundingClientRect().width;
      dragRef.current = {
        grid,
        startWidth,
        floor: Math.min(minWidth, startWidth),
        pxPerScreenPx: screenWidth > 0 ? startWidth / screenWidth : 1,
        direction: isRtl(cell) ? -1 : 1,
        committedTemplate: grid.style.getPropertyValue(columnTemplateVar),
        width: startWidth,
      };
    },
    // The drag writes the template straight to the grid, so the table re-renders once, on release.
    onMove: ({ deltaX }) => {
      const drag = dragRef.current;
      if (!drag) return;
      drag.width = Math.max(
        drag.floor,
        Math.round(drag.startWidth + deltaX * drag.pxPerScreenPx * drag.direction),
      );
      drag.grid.style.setProperty(
        columnTemplateVar,
        getColumnTemplate(header.getContext().table.getVisibleLeafColumns(), {
          ...columnSizing,
          [column.id]: drag.width,
        }),
      );
    },
    onEnd: (_, { cancelled }) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      // Back to what React last rendered, so a width the owner of `columnSizing` refuses doesn't stick.
      drag.grid.style.setProperty(columnTemplateVar, drag.committedTemplate);
      if (!cancelled && drag.width !== drag.startWidth) {
        flushSync(() => resizeColumn(column.id, drag.width));
      }
    },
  });

  const currentWidth = columnSizing[column.id] ?? renderedWidth;

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const cell = event.currentTarget.parentElement;
    if (!cell) return;
    const width = cell.offsetWidth;
    const floor = Math.min(minWidth, width);
    const key = mirrorArrowKey(event.key, rtl);
    if (key === "ArrowRight") resizeColumn(column.id, width + KEYBOARD_STEP);
    else if (key === "ArrowLeft") resizeColumn(column.id, Math.max(floor, width - KEYBOARD_STEP));
    else if (event.key === "Home") resizeColumn(column.id, floor);
    else if (event.key === "Enter") resizeColumn(column.id, undefined);
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <styled.span
      ref={handleRef}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`${labels.resizeColumn} ${getColumnLabel(header)}`}
      aria-valuemin={currentWidth === undefined ? minWidth : Math.min(minWidth, currentWidth)}
      aria-valuemax={Number.MAX_SAFE_INTEGER}
      aria-valuenow={currentWidth}
      data-slot="columnResizeHandle"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => resizeColumn(column.id, undefined)}
      position="absolute"
      top="0"
      bottom="0"
      insetInlineEnd="0"
      width="1.5"
      cursor="col-resize"
      touchAction="none"
      zIndex="1"
      css={{
        _after: {
          content: '""',
          position: "absolute",
          insetBlock: "0",
          insetInlineEnd: "0",
          width: "0.5",
          transition: "colors",
        },
        _hover: { _after: { bg: "colorPalette.solid.bg" } },
        _focusVisible: { outline: "none", _after: { bg: "colorPalette.solid.bg" } },
        "&[data-resizing]": { _after: { bg: "colorPalette.solid.bg" } },
      }}
    />
  );
};
