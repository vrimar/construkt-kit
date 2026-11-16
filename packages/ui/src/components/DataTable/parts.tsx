import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { table } from "#styled-system/recipes";

import { gridRowStyle } from "./columnTemplate";

const { withRootProvider, withContext } = createSlotRecipeContext(table);

export const GridRoot = withRootProvider(Box, { defaultProps: { role: "table" } });
export const GridHead = withContext(ark.div, "head", { defaultProps: { role: "rowgroup" } });
export const GridBody = withContext(ark.div, "body", { defaultProps: { role: "rowgroup" } });
export const GridHeader = withContext(ark.div, "header", {
  defaultProps: { role: "columnheader" },
});
export const GridCell = withContext(ark.div, "cell", { defaultProps: { role: "cell" } });

const Row = withContext(ark.div, "row", { defaultProps: { role: "row" } });

export const GridRow = ({ style, ...props }: ComponentProps<typeof Row>) => (
  <Row
    display="grid"
    {...props}
    style={{ ...style, ...gridRowStyle }}
  />
);
