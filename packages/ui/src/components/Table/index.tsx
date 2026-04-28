import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { table } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(table);

const Root = withProvider(ark.table, "root");
const Body = withContext(ark.tbody, "body");
const Caption = withContext(ark.caption, "caption");
const Cell = withContext(ark.td, "cell");
const Foot = withContext(ark.tfoot, "foot");
const Head = withContext(ark.thead, "head");
const Header = withContext(ark.th, "header");
const Row = withContext(ark.tr, "row");

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
};
