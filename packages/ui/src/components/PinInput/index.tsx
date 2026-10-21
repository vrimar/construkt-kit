import { PinInput as ArkPinInput, PinInputContext } from "@ark-ui/react/pin-input";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pinInput } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(pinInput);

const Root = withProvider(ArkPinInput.Root, "root", {
  forwardProps: ["mask"],
});

export type PinInputRootProps = ComponentProps<typeof Root>;

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
