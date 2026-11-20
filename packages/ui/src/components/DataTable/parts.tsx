import type { ComponentProps } from "react";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { table } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { gridRowStyle } from "./columnTemplate";

const { withRootProvider, withContext } = createSlotRecipeContext(table);

export const GridRoot = withRootProvider(Box, { defaultProps: { role: "table" } });
export const GridHead = withContext(renderable.div, "head", { defaultProps: { role: "rowgroup" } });
export const GridBody = withContext(renderable.div, "body", { defaultProps: { role: "rowgroup" } });
export const GridHeader = withContext(renderable.div, "header", {
  defaultProps: { role: "columnheader" },
});
export const GridCell = withContext(renderable.div, "cell", { defaultProps: { role: "cell" } });

const Row = withContext(renderable.div, "row", { defaultProps: { role: "row" } });

export const GridRow = ({ style, ...props }: ComponentProps<typeof Row>) => (
  <Row
    display="grid"
    {...props}
    style={{ ...style, ...gridRowStyle }}
  />
);
