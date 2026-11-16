import { useId } from "react";

import { Box, type BoxProps } from "#styled-system/jsx";

import { type ResponsiveValue, responsiveVarRules } from "../../foundations/breakpoints";
import { toCssSize } from "../../foundations/cssSize";

export interface SimpleGridProps extends Omit<BoxProps, "columns"> {
  /** Number of equal-width columns. Accepts a static number, a responsive object,
   *  or a runtime number. */
  // oxlint-disable-next-line construkt/no-style-prop-name
  columns?: ResponsiveValue<number>;
  /** Lay out as many equal columns as fit at this minimum width (px if a number). Ignored when
   *  `columns` is set. */
  minChildWidth?: string | number;
  /** Alias for `gap`. */
  spacing?: BoxProps["gap"];
  /** Alias for `columnGap`. */
  spacingX?: BoxProps["columnGap"];
  /** Alias for `rowGap`. */
  spacingY?: BoxProps["rowGap"];
}

/** Scoped custom property so a parent `--columns` can't leak in via inheritance. */
const COLUMN_VAR = "--simple-grid-columns" as const;

/**
 * Responsive CSS grid of equal-width columns. The column count is written to a custom
 * property (inline for numbers, scoped `<style>` for responsive objects), so runtime
 * values work with no static extraction, no resize listener, and SSR-safe.
 *
 * `gap`/`spacing*` and other forwarded box props follow Panda static extraction: use
 * the standard spacing scale, since a one-off value unused elsewhere may not emit CSS.
 */
export const SimpleGrid = ({
  ref,
  columns,
  minChildWidth,
  spacing,
  spacingX,
  spacingY,
  gap,
  columnGap,
  rowGap,
  style,
  children,
  ...rest
}: SimpleGridProps) => {
  const gridId = useId();

  const columnStyle: Record<string, string | number> = {};
  let responsiveRules = "";

  if (typeof columns === "number") {
    columnStyle[COLUMN_VAR] = Math.max(1, columns);
  } else if (columns != null) {
    responsiveRules = responsiveVarRules(`[data-simple-grid="${gridId}"]`, COLUMN_VAR, columns);
  } else if (minChildWidth) {
    columnStyle.gridTemplateColumns = `repeat(auto-fit, minmax(${toCssSize(minChildWidth)}, 1fr))`;
  }

  return (
    <>
      {responsiveRules ? <style>{responsiveRules}</style> : null}
      <Box
        ref={ref}
        display="grid"
        gridTemplateColumns={`repeat(var(${COLUMN_VAR}, 1), minmax(0, 1fr))`}
        gap={gap ?? spacing}
        columnGap={columnGap ?? spacingX}
        rowGap={rowGap ?? spacingY}
        data-simple-grid={responsiveRules ? gridId : undefined}
        style={{ ...columnStyle, ...style }}
        {...rest}
      >
        {children}
      </Box>
    </>
  );
};
