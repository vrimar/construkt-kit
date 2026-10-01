import {
  Checkbox as ArkCheckbox,
  CheckboxContext,
  useCheckboxContext,
} from "@ark-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import type { ComponentProps, InputHTMLAttributes, ReactNode, Ref } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { checkbox } from "#styled-system/recipes";
import type { HTMLStyledProps } from "#styled-system/types";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(checkbox);

// Primitives — exported for sibling components (CheckboxCard), not re-exported from barrel
export type RootProps = ComponentProps<typeof Root>;
export type HiddenInputProps = ComponentProps<typeof HiddenInput>;
export const Root = withProvider(ArkCheckbox.Root, "root");
export const RootProvider = withProvider(ArkCheckbox.RootProvider, "root");
export const Control = withContext(ArkCheckbox.Control, "control");
export const Group = withProvider(ArkCheckbox.Group, "group");
export const Label = withContext(ArkCheckbox.Label, "label");
export const HiddenInput = ArkCheckbox.HiddenInput;

export {
  CheckboxGroupProvider as GroupProvider,
  type CheckboxCheckedState as CheckedState,
} from "@ark-ui/react/checkbox";

const CheckGlyph = styled(CheckIcon);
const MinusGlyph = styled(MinusIcon);

export const Indicator = ({ ref, ...props }: WithRef<HTMLStyledProps<"svg">, SVGSVGElement>) => {
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

export interface CheckboxProps extends Omit<RootProps, "ref"> {
  icon?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  rootRef?: Ref<HTMLLabelElement>;
}

function CheckboxSimple({
  ref,
  icon,
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
      <Control>{icon || <Indicator />}</Control>
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
