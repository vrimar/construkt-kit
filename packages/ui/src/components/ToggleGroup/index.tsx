import { ToggleGroup as ArkToggleGroup, ToggleGroupContext } from "@ark-ui/react/toggle-group";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { toggleGroup } from "#styled-system/recipes";

import { useToolbarContext } from "../Toolbar/toolbarContext";

const { withProvider, withContext } = createSlotRecipeContext(toggleGroup);

const StyledRoot = withProvider(ArkToggleGroup.Root, "root");
const RootProvider = withProvider(ArkToggleGroup.RootProvider, "root");
const StyledItem = withContext(ArkToggleGroup.Item, "item");

export type ToggleGroupRootProps = ComponentProps<typeof StyledRoot>;

function Item({ onKeyDownCapture, ...props }: ComponentProps<typeof StyledItem>) {
  const toolbar = useToolbarContext();
  return (
    <StyledItem
      {...props}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        // zag cancels arrow keys even with rovingFocus off, so the toolbar has to move first.
        toolbar?.navigate(event);
      }}
    />
  );
}

/** Inside a `Toolbar`, its items join the toolbar's arrow keys and single tab stop. */
function Root(props: ToggleGroupRootProps) {
  const inToolbar = useToolbarContext() !== null;
  return (
    <StyledRoot
      {...(inToolbar && { rovingFocus: false, tabIndex: -1 })}
      {...props}
    />
  );
}

export const ToggleGroup = {
  Root,
  RootProvider,
  Item,
  Context: ToggleGroupContext,
};
