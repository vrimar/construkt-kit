import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { dataList } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(dataList);

const Root = withProvider(ark.dl, "root");
const Item = withContext(ark.div, "item");
const ItemLabel = withContext(ark.dt, "itemLabel");
const ItemValue = withContext(ark.dd, "itemValue");

export type DataListRootProps = ComponentProps<typeof Root>;

export const DataList = {
  Root,
  Item,
  ItemLabel,
  ItemValue,
};
