import { NumberInput as ArkNumberInput, NumberInputContext } from "@ark-ui/react/number-input";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { numberInput } from "@construkt-kit/styled-system/recipes";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(numberInput);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkNumberInput.Root, "root");
const DecrementTrigger = withContext(ArkNumberInput.DecrementTrigger, "decrementTrigger", {
  defaultProps: { children: <ChevronDownIcon /> },
});
const IncrementTrigger = withContext(ArkNumberInput.IncrementTrigger, "incrementTrigger", {
  defaultProps: { children: <ChevronUpIcon /> },
});
const Input = withContext(ArkNumberInput.Input, "input");
const Label = withContext(ArkNumberInput.Label, "label");
const Scrubber = withContext(ArkNumberInput.Scrubber, "scrubber");
const Control = withContext(ArkNumberInput.Control, "control", {
  defaultProps: {
    children: (
      <>
        <IncrementTrigger />
        <DecrementTrigger />
      </>
    ),
  },
});

export type NumberInputProps = RootProps;

function NumberInputSimple({ ref, children, ...rest }: WithRef<NumberInputProps>) {
  return (
    <Root
      ref={ref}
      {...rest}
    >
      {children}
    </Root>
  );
}

export const NumberInput = Object.assign(NumberInputSimple, {
  Root: NumberInputSimple,
  Field: Input,
  Control,
  Scrubber,
  Label,
  Context: NumberInputContext,
});
