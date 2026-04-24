import { Portal } from "@ark-ui/react/portal";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { tooltip } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";

const { withRootProvider, withContext } = createStyleContext(tooltip);

type RootProps = ComponentProps<typeof Root>;
type ContentProps = ComponentProps<typeof Content>;
const Root = withRootProvider(ArkTooltip.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const Arrow = withContext(ArkTooltip.Arrow, "arrow");
const ArrowTip = withContext(ArkTooltip.ArrowTip, "arrowTip");
const Content = withContext(ArkTooltip.Content, "content");
const Positioner = withContext(ArkTooltip.Positioner, "positioner");
const Trigger = withContext(ArkTooltip.Trigger, "trigger");

export { TooltipContext as Context } from "@ark-ui/react/tooltip";

export interface TooltipProps extends Omit<RootProps, "content"> {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode | undefined;
  content: React.ReactNode | string;
  contentProps?: ContentProps;
  disabled?: boolean;
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

export const Tooltip = ({
  ref,
  showArrow,
  children,
  disabled,
  portalled = true,
  content,
  contentProps,
  portalRef,
  placement = "top",
  ...rootProps
}: WithRef<TooltipProps>) => {
  if (disabled) return children;

  return (
    <Root
      openDelay={300}
      closeDelay={0}
      positioning={{ placement }}
      {...rootProps}
    >
      <Trigger asChild>{children}</Trigger>
      <Portal
        disabled={!portalled}
        container={portalRef}
      >
        <Positioner zIndex="tooltip">
          <Content
            ref={ref}
            zIndex="tooltip"
            {...contentProps}
          >
            {showArrow && (
              <Arrow>
                <ArrowTip />
              </Arrow>
            )}
            {content}
          </Content>
        </Positioner>
      </Portal>
    </Root>
  );
};
