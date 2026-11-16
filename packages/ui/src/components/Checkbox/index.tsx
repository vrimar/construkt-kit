import {
  Checkbox as ArkCheckbox,
  CheckboxContext,
  useCheckboxContext,
} from "@ark-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { checkbox } from "#styled-system/recipes";
import type { HTMLStyledProps } from "#styled-system/types";

import type { HiddenInputControlProps, WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(checkbox);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkCheckbox.Root, "root");
const RootProvider = withProvider(ArkCheckbox.RootProvider, "root");
const Control = withContext(ArkCheckbox.Control, "control");
const Group = withProvider(ArkCheckbox.Group, "group");
const Label = withContext(ArkCheckbox.Label, "label");
const HiddenInput = ArkCheckbox.HiddenInput;

export {
  type CheckboxCheckedState,
  type UseCheckboxProps,
  type UseCheckboxReturn,
  useCheckbox,
} from "@ark-ui/react/checkbox";

const CheckGlyph = styled(CheckIcon);
const MinusGlyph = styled(MinusIcon);

const Indicator = ({ ref, ...props }: WithRef<HTMLStyledProps<"svg">, SVGSVGElement>) => {
  const { indeterminate } = useCheckboxContext();
  const Glyph = indeterminate ? MinusGlyph : CheckGlyph;

  return (
    <ArkCheckbox.Indicator
      indeterminate={indeterminate}
      asChild
    >
      <Glyph
        ref={ref}
        strokeWidth={3}
        {...props}
      />
    </ArkCheckbox.Indicator>
  );
};

export interface CheckboxProps extends Omit<RootProps, "ref">, HiddenInputControlProps {
  /** Drawn inside the box. `null` leaves the tick out but keeps the box. */
  indicator?: ReactNode;
}

function CheckboxSimple({
  ref,
  indicator = <Indicator />,
  children,
  inputProps,
  rootRef,
  ...rest
}: WithRef<CheckboxProps, HTMLInputElement>) {
  return (
    <Root
      ref={rootRef}
      {...rest}
    >
      <HiddenInput
        ref={ref}
        {...inputProps}
      />
      <Control>{indicator}</Control>
      {children != null && <Label>{children}</Label>}
    </Root>
  );
}

export const Checkbox = Object.assign(CheckboxSimple, {
  Root,
  RootProvider,
  Control,
  Group,
  Label,
  HiddenInput,
  Indicator,
  Context: CheckboxContext,
});
