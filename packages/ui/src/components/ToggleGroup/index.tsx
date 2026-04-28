import { ToggleGroup as ArkToggleGroup, ToggleGroupContext } from "@ark-ui/react/toggle-group";
import { createStyleContext } from "@construct-kit/styled-system/jsx";
import { toggleGroup } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "react";

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
