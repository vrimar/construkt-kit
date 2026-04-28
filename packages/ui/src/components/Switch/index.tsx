import { ark } from "@ark-ui/react/factory";
import { Switch as ArkSwitch, useSwitchContext } from "@ark-ui/react/switch";
import { createStyleContext, styled } from "@construkt-kit/styled-system/jsx";
import { switchRecipe } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps, InputHTMLAttributes, ReactNode, Ref } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(switchRecipe);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkSwitch.Root, "root");
const Label = withContext(ArkSwitch.Label, "label");
const Thumb = withContext(ArkSwitch.Thumb, "thumb");
const HiddenInput = ArkSwitch.HiddenInput;
const Control = withContext(ArkSwitch.Control, "control", {
  defaultProps: { children: <Thumb /> },
});

interface IndicatorProps extends ComponentProps<typeof StyledIndicator> {
  fallback?: ReactNode | undefined;
}

const StyledIndicator = withContext(ark.span, "indicator");
function Indicator({ ref, fallback, children, ...rest }: WithRef<IndicatorProps, HTMLSpanElement>) {
  const api = useSwitchContext();
  return (
    <StyledIndicator
      ref={ref}
      data-checked={api.checked ? "" : undefined}
      {...rest}
    >
      {api.checked ? children : fallback}
    </StyledIndicator>
  );
}

interface ThumbIndicatorProps extends ComponentProps<typeof StyledThumbIndicator> {
  fallback?: ReactNode | undefined;
}

const StyledThumbIndicator = styled(ark.span);
function ThumbIndicator({
  ref,
  fallback,
  children,
  ...rest
}: WithRef<ThumbIndicatorProps, HTMLSpanElement>) {
  const api = useSwitchContext();
  return (
    <StyledThumbIndicator
      ref={ref}
      data-checked={api.checked ? "" : undefined}
      {...rest}
    >
      {api.checked ? children : fallback}
    </StyledThumbIndicator>
  );
}

export interface SwitchProps extends RootProps {
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  rootRef?: Ref<HTMLLabelElement>;
  trackLabel?: { on: ReactNode; off: ReactNode };
  thumbLabel?: { on: ReactNode; off: ReactNode };
}

export const Switch = ({
  ref,
  inputProps,
  children,
  rootRef,
  trackLabel,
  thumbLabel,
  ...rest
}: WithRef<SwitchProps, HTMLInputElement>) => {
  return (
    <Root
      ref={rootRef}
      cursor="pointer"
      {...rest}
    >
      <HiddenInput
        ref={ref}
        {...inputProps}
      />
      <Control>
        <Thumb>
          {thumbLabel && (
            <ThumbIndicator fallback={thumbLabel?.off}>{thumbLabel?.on}</ThumbIndicator>
          )}
        </Thumb>
        {trackLabel && <Indicator fallback={trackLabel.off}>{trackLabel.on}</Indicator>}
      </Control>
      {children != null && <Label>{children}</Label>}
    </Root>
  );
};
