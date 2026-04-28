import { PinInput as ArkPinInput, PinInputContext } from "@ark-ui/react/pin-input";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { pinInput } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(pinInput);

const Root = withProvider(ArkPinInput.Root, "root", {
  forwardProps: ["mask"],
});
const RootProvider = withProvider(ArkPinInput.RootProvider, "root");
const Control = withContext(ArkPinInput.Control, "control");
const HiddenInput = ArkPinInput.HiddenInput;
const Input = withContext(ArkPinInput.Input, "input");
const Label = withContext(ArkPinInput.Label, "label");

export type PinInputRootProps = ComponentProps<typeof Root>;

export const PinInput = {
  Root,
  RootProvider,
  Control,
  HiddenInput,
  Input,
  Label,
  Context: PinInputContext,
};
