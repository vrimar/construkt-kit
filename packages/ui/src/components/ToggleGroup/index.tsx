import { ToggleGroup as ArkToggleGroup, ToggleGroupContext } from "@ark-ui/react/toggle-group";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { toggleGroup } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toggleGroup);

const Root = withProvider(ArkToggleGroup.Root, "root");
const RootProvider = withProvider(ArkToggleGroup.RootProvider, "root");
const Item = withContext(ArkToggleGroup.Item, "item");

export type ToggleGroupRootProps = ComponentProps<typeof Root>;

export const ToggleGroup = {
  Root,
  RootProvider,
  Item,
  Context: ToggleGroupContext,
};
