import { PinInput as ArkPinInput, PinInputContext } from "@ark-ui/react/pin-input";
import type { ComponentProps, ComponentType } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pinInput } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(pinInput);

const StyledRoot = withProvider(ArkPinInput.Root, "root", {
  forwardProps: ["mask"],
});

export type PinInputRootProps = Omit<ComponentProps<typeof StyledRoot>, "mask"> & {
  mask?: boolean;
};

const Root = StyledRoot as ComponentType<PinInputRootProps>;
const RootProvider = withProvider(ArkPinInput.RootProvider, "root");
const Control = withContext(ArkPinInput.Control, "control");
const HiddenInput = ArkPinInput.HiddenInput;
const Input = withContext(ArkPinInput.Input, "input");
const Label = withContext(ArkPinInput.Label, "label");

export const PinInput = {
  Root,
  RootProvider,
  Control,
  HiddenInput,
  Input,
  Label,
  Context: PinInputContext,
};
