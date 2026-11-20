import type { ComponentProps } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { table } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(table);

const Root = withProvider(renderable.table, "root");
const Body = withContext(renderable.tbody, "body");
const Caption = withContext(renderable.caption, "caption");
const Cell = withContext(renderable.td, "cell");
const Foot = withContext(renderable.tfoot, "foot");
const Head = withContext(renderable.thead, "head");
const Header = withContext(renderable.th, "header");
const Row = withContext(renderable.tr, "row");
const ScrollAreaElement = styled(renderable.div);

/**
 * Horizontal-scroll wrapper for `Table.Root`. Cells use `whiteSpace: nowrap`,
 * so wrap a multi-column table in this on narrow viewports to scroll instead of
 * clipping. `overflowX` can't go on the `<table>` element itself — it needs a
 * block container, which this provides.
 */
const ScrollArea = (props: ComponentProps<typeof ScrollAreaElement>) => (
  <ScrollAreaElement
    width="100%"
    maxWidth="100%"
    overflowX="auto"
    overscrollBehaviorX="contain"
    {...props}
  />
);

export type TableRootProps = ComponentProps<typeof Root>;

export const Table = {
  Root,
  Body,
  Caption,
  Cell,
  Foot,
  Head,
  Header,
  Row,
  ScrollArea,
};
