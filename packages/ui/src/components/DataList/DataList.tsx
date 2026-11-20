import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { dataList } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(dataList);

const Root = withProvider(renderable.dl, "root");
const Item = withContext(renderable.div, "item");
const ItemLabel = withContext(renderable.dt, "itemLabel");
const ItemValue = withContext(renderable.dd, "itemValue");

export type DataListRootProps = ComponentProps<typeof Root>;

export const DataList = {
  Root,
  Item,
  ItemLabel,
  ItemValue,
};
