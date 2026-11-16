import { ark } from "@ark-ui/react/factory";
import { Switch as ArkSwitch, useSwitchContext } from "@ark-ui/react/switch";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { switchRecipe } from "#styled-system/recipes";

import type { HiddenInputControlProps, WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(switchRecipe);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkSwitch.Root, "root");
const Label = withContext(ArkSwitch.Label, "label");
const Thumb = withContext(ArkSwitch.Thumb, "thumb");
const HiddenInput = ArkSwitch.HiddenInput;
const Control = withContext(ArkSwitch.Control, "control");
const Indicator = withContext(ark.span, "indicator");

interface SwitchLabel {
  on: ReactNode;
  off: ReactNode;
}

export interface SwitchProps extends Omit<RootProps, "ref">, HiddenInputControlProps {
  trackLabel?: SwitchLabel;
  thumbLabel?: SwitchLabel;
}

function SwitchControl({ trackLabel, thumbLabel }: Pick<SwitchProps, "trackLabel" | "thumbLabel">) {
  const { checked } = useSwitchContext();
  const pick = (label: SwitchLabel) => (checked ? label.on : label.off);

  return (
    <Control>
      <Thumb>{thumbLabel && pick(thumbLabel)}</Thumb>
      {trackLabel && (
        <Indicator data-checked={checked ? "" : undefined}>{pick(trackLabel)}</Indicator>
      )}
    </Control>
  );
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
      <SwitchControl
        trackLabel={trackLabel}
        thumbLabel={thumbLabel}
      />
      {children != null && <Label>{children}</Label>}
    </Root>
  );
};
