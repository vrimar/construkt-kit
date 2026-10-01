import { Portal } from "@ark-ui/react/portal";
import { Toaster as ArkToaster, Toast, createToaster, useToastContext } from "@ark-ui/react/toast";

import { Stack, createSlotRecipeContext, styled } from "#styled-system/jsx";
import { toast } from "#styled-system/recipes";

import type { WithRef } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { Icon, type IconProps } from "../Icon";
import { Spinner } from "../Spinner";
import { statusIcons } from "../statusIcons";

const { withProvider, withContext } = createSlotRecipeContext(toast);

const Root = withProvider(Toast.Root, "root");
const Title = withContext(Toast.Title, "title");
const Description = withContext(Toast.Description, "description");
const ActionTrigger = withContext(Toast.ActionTrigger, "actionTrigger");
const CloseTrigger = createCloseTrigger(withContext(Toast.CloseTrigger, "closeTrigger"));
const StyledToaster = styled(ArkToaster);

function Indicator({ ref, ...props }: WithRef<IconProps, SVGSVGElement>) {
  const toastCtx = useToastContext();

  const StatusIcon = statusIcons[toastCtx.type];
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

const APP_HEADER_HEIGHT = "80px";
const VIEWPORT_INSET = "40px";

export const toaster: ReturnType<typeof createToaster> = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
  overlap: true,
  max: 5,
  offsets: {
    top: APP_HEADER_HEIGHT,
    bottom: "0px",
    left: "0px",
    right: VIEWPORT_INSET,
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
            {options.closable && <CloseTrigger />}
          </Root>
        )}
      </StyledToaster>
    </Portal>
  );
};
