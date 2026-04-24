import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { actionbar } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";
import { Popover } from "../Popover";
import { Positioner as PopoverPositioner } from "../Popover/Popover";

const { withRootProvider, withContext } = createStyleContext(actionbar);

const Root = withRootProvider(Popover.Root);
const Positioner = PopoverPositioner;
const Content = withContext(ark.div, "content");
const Separator = withContext(ark.div, "separator");
const SelectionTrigger = withContext(ark.button, "selectionTrigger");
const CloseTrigger = withContext(ark.button, "closeTrigger");

export type ActionBarRootProps = ComponentProps<typeof Root>;

export interface ActionBarContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
}

function ActionBarContent({
  ref,
  portalled = true,
  portalRef,
  ...rest
}: WithRef<ActionBarContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Positioner>
        <Content
          ref={ref}
          {...rest}
        />
      </Positioner>
    </Portal>
  );
}

export const ActionBar = {
  Root,
  Content: ActionBarContent,
  Separator,
  SelectionTrigger,
  CloseTrigger,
};
