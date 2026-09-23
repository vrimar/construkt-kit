import { ark } from "@ark-ui/react/factory";
import { Switch as ArkSwitch, useSwitchContext } from "@ark-ui/react/switch";
import { createStyleContext, styled } from "@construkt-kit/styled-system/jsx";
import { switchRecipe } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps, ElementType, InputHTMLAttributes, ReactNode, Ref } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(switchRecipe);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkSwitch.Root, "root");
const Label = withContext(ArkSwitch.Label, "label");
const Thumb = withContext(ArkSwitch.Thumb, "thumb");
const HiddenInput = ArkSwitch.HiddenInput;
const Control = withContext(ArkSwitch.Control, "control");

interface CheckedSwapProps {
  fallback?: ReactNode | undefined;
  children?: ReactNode;
}

function createCheckedSwap(Base: ElementType) {
  return function CheckedSwap({ fallback, children, ...rest }: CheckedSwapProps) {
    const api = useSwitchContext();
    return (
      <Base
        data-checked={api.checked ? "" : undefined}
        {...rest}
      >
        {api.checked ? children : fallback}
      </Base>
    );
  };
}

const Indicator = createCheckedSwap(withContext(ark.span, "indicator"));
const ThumbIndicator = createCheckedSwap(styled(ark.span));

export interface SwitchProps extends Omit<RootProps, "ref"> {
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
      {...rest}
    >
      <HiddenInput
        ref={ref}
        {...inputProps}
      />
      <Control>
        <Thumb>
          {thumbLabel && <ThumbIndicator fallback={thumbLabel.off}>{thumbLabel.on}</ThumbIndicator>}
        </Thumb>
        {trackLabel && <Indicator fallback={trackLabel.off}>{trackLabel.on}</Indicator>}
      </Control>
      {children != null && <Label>{children}</Label>}
    </Root>
  );
};
