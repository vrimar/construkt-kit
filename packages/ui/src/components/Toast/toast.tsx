import { Portal } from "@ark-ui/react/portal";
import { Toaster as ArkToaster, Toast, createToaster, useToastContext } from "@ark-ui/react/toast";
import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from "lucide-react";
import { Stack, createStyleContext, styled } from "styled-system/jsx";
import { toast } from "styled-system/recipes";

import type { WithRef } from "../../types";
import { CloseButton } from "../Buttons/CloseButton";
import { Icon, type IconProps } from "../Icon";
import { Spinner } from "../Spinner";

const { withProvider, withContext } = createStyleContext(toast);

const Root = withProvider(Toast.Root, "root");
const Title = withContext(Toast.Title, "title");
const Description = withContext(Toast.Description, "description");
const ActionTrigger = withContext(Toast.ActionTrigger, "actionTrigger");
const CloseTrigger = withContext(Toast.CloseTrigger, "closeTrigger");
const StyledToaster = styled(ArkToaster);

const iconMap: Record<string, React.ElementType> = {
  warning: CircleAlertIcon,
  success: CheckCircleIcon,
  error: CircleXIcon,
};

function Indicator({ ref, ...props }: WithRef<IconProps, SVGSVGElement>) {
  const toastCtx = useToastContext();

  const StatusIcon = iconMap[toastCtx.type];
  if (!StatusIcon) return null;

  return (
    <Icon
      ref={ref}
      data-type={toastCtx.type}
      {...props}
    >
      <StatusIcon />
    </Icon>
  );
}

export const toaster: ReturnType<typeof createToaster> = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
  overlap: true,
  max: 5,
  offsets: {
    top: "80px",
    bottom: "0px",
    left: "0px",
    right: "40px",
  },
});

export const Toaster = () => {
  return (
    <Portal>
      <StyledToaster
        toaster={toaster}
        insetInline={{ mdDown: "4" }}
      >
        {(options) => (
          <Root>
            {options.type === "loading" ? <Spinner color="colorPalette.plain.fg" /> : <Indicator />}

            <Stack
              gap="3"
              alignItems="start"
            >
              <Stack gap="1">
                {options.title && <Title>{options.title}</Title>}
                {options.description && <Description>{options.description}</Description>}
              </Stack>
              {options.action && <ActionTrigger>{options.action.label}</ActionTrigger>}
            </Stack>
            {options.closable && (
              <CloseTrigger asChild>
                <CloseButton size="sm" />
              </CloseTrigger>
            )}
          </Root>
        )}
      </StyledToaster>
    </Portal>
  );
};
