import { ToggleGroup as ArkToggleGroup, ToggleGroupContext } from "@ark-ui/react/toggle-group";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { toggleGroup } from "#styled-system/recipes";

import { useToolbarContext } from "../Toolbar/toolbarContext";

const { withProvider, withContext } = createSlotRecipeContext(toggleGroup);

const StyledRoot = withProvider(ArkToggleGroup.Root, "root");
const StyledRootProvider = withProvider(ArkToggleGroup.RootProvider, "root");
const StyledItem = withContext(ArkToggleGroup.Item, "item");

export type ToggleGroupRootProps = ComponentProps<typeof StyledRoot>;
export type ToggleGroupRootProviderProps = ComponentProps<typeof StyledRootProvider>;

const ROVING_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);

function Item({ onKeyDownCapture, ...props }: ComponentProps<typeof StyledItem>) {
  const toolbar = useToolbarContext();
  return (
    <StyledItem
      tabIndex={toolbar ? 0 : undefined}
      {...props}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        if (!toolbar) return;
        toolbar.navigate(event);
        // zag cancels these keys and, with rovingFocus on, moves focus too: the toolbar moves first.
        if (ROVING_KEYS.has(event.key)) event.preventDefault();
      }}
    />
  );
}

const useToolbarRootProps = () => (useToolbarContext() === null ? undefined : { tabIndex: -1 });

/** Inside a `Toolbar`, its items join the toolbar's arrow keys and single tab stop. */
function Root(props: ToggleGroupRootProps) {
  return (
    <StyledRoot
      {...useToolbarRootProps()}
      {...props}
    />
  );
}

/** Inside a `Toolbar`, its items join the toolbar's arrow keys and single tab stop. */
function RootProvider(props: ToggleGroupRootProviderProps) {
  return (
    <StyledRootProvider
      {...useToolbarRootProps()}
      {...props}
    />
  );
}

/**
 * Buttons that each turn something on or off, such as formatting or filters. To pick exactly one value, use
 * `SegmentGroup`.
 */
export const ToggleGroup = {
  Root,
  RootProvider,
  Item,
  Context: ToggleGroupContext,
};

export {
  type UseToggleGroupProps,
  type UseToggleGroupReturn,
  useToggleGroup,
} from "@ark-ui/react/toggle-group";
