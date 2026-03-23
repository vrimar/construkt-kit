import { Portal } from "@ark-ui/react/portal";
import { Toaster as ArkToaster, createToaster, Toast, useToastContext } from "@ark-ui/react/toast";
import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from "lucide-react";
import { createStyleContext, Stack, styled } from "styled-system/jsx";
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
  const toast = useToastContext();

  const StatusIcon = iconMap[toast.type];
  if (!StatusIcon) return null;

  return (
    <Icon
      ref={ref}
      data-type={toast.type}
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
        {(toast) => (
          <Root>
            {toast.type === "loading" ? <Spinner color="colorPalette.plain.fg" /> : <Indicator />}

            <Stack
              gap="3"
              alignItems="start"
            >
              <Stack gap="1">
                {toast.title && <Title>{toast.title}</Title>}
                {toast.description && <Description>{toast.description}</Description>}
              </Stack>
              {toast.action && <ActionTrigger>{toast.action.label}</ActionTrigger>}
            </Stack>
            {toast.closable && (
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
