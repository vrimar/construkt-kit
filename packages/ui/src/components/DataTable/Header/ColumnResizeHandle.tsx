import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { styled } from "#styled-system/jsx";

import { usePointerDrag } from "../../../hooks/usePointerDrag";
import { MIN_RESIZED_COLUMN_WIDTH, columnTemplateVar, getColumnTemplate } from "../columnTemplate";
import { useDataTableContext } from "../context";
import type { DataTableHeader } from "../types";
import { getColumnLabel } from "./columnLabel";

const KEYBOARD_STEP = 16;

interface ColumnResizeHandleProps<TData extends object> {
  header: DataTableHeader<TData>;
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
}: ColumnResizeHandleProps<TData>) => {
  const { columnSizing, resizeColumn, labels } = useDataTableContext<TData>();
  const { column } = header;
  const handleRef = useRef<HTMLSpanElement>(null);
  const [renderedWidth, setRenderedWidth] = useState<number>();
  const dragRef = useRef<ResizeDrag | null>(null);
  const resizable = resizeColumn !== undefined;

  useLayoutEffect(() => {
    const cell = handleRef.current?.parentElement;
    if (!resizable || !cell) return;
    const observer = new ResizeObserver(([entry]) => {
      const inlineSize = entry?.borderBoxSize[0]?.inlineSize;
      if (inlineSize !== undefined) setRenderedWidth(Math.round(inlineSize));
    });
    observer.observe(cell);
    return () => observer.disconnect();
  }, [resizable]);

  const minWidth = column.columnDef.meta?.minWidth ?? MIN_RESIZED_COLUMN_WIDTH;

  const { onPointerDown } = usePointerDrag<HTMLSpanElement>({
    onPress: (event) => {
      event.preventDefault();
      event.stopPropagation();
      const cell = event.currentTarget.parentElement;
      const grid = event.currentTarget.closest<HTMLElement>("[role=table]");
      if (!resizeColumn || !cell || !grid) return false;
      const startWidth = cell.offsetWidth;
      // clientX is in screen px, which a scaled ancestor makes differ from layout px.
      const screenWidth = cell.getBoundingClientRect().width;
      dragRef.current = {
        grid,
        startWidth,
        floor: Math.min(minWidth, startWidth),
        pxPerScreenPx: screenWidth > 0 ? startWidth / screenWidth : 1,
        direction: getComputedStyle(cell).direction === "rtl" ? -1 : 1,
        committedTemplate: grid.style.getPropertyValue(columnTemplateVar),
        width: startWidth,
      };
    },
    onStart: () => handleRef.current?.toggleAttribute("data-resizing", true),
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
      handleRef.current?.toggleAttribute("data-resizing", false);
      if (!drag) return;
      // Back to what React last rendered, so a width the owner of `columnSizing` refuses doesn't stick.
      drag.grid.style.setProperty(columnTemplateVar, drag.committedTemplate);
      if (!cancelled && drag.width !== drag.startWidth) {
        flushSync(() => resizeColumn?.(column.id, drag.width));
      }
    },
  });

  if (!resizeColumn) return null;

  const currentWidth = columnSizing[column.id] ?? renderedWidth;

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const cell = event.currentTarget.parentElement;
    if (!cell) return;
    const rtl = getComputedStyle(cell).direction === "rtl";
    const width = cell.offsetWidth;
    const floor = Math.min(minWidth, width);
    const grow = rtl ? "ArrowLeft" : "ArrowRight";
    const shrink = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === grow) resizeColumn(column.id, width + KEYBOARD_STEP);
    else if (event.key === shrink) resizeColumn(column.id, Math.max(floor, width - KEYBOARD_STEP));
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
      data-part="column-resize-handle"
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
