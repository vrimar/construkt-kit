import {
  Checkbox as ArkCheckbox,
  CheckboxContext,
  useCheckboxContext,
} from "@ark-ui/react/checkbox";
import type { ComponentProps, InputHTMLAttributes, ReactNode, Ref } from "react";
import { createStyleContext, styled } from "styled-system/jsx";
import { checkbox } from "styled-system/recipes";
import type { HTMLStyledProps } from "styled-system/types";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(checkbox);

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

export const Indicator = ({ ref, ...props }: WithRef<HTMLStyledProps<"svg">, SVGSVGElement>) => {
  const { indeterminate, checked } = useCheckboxContext();

  return (
    <ArkCheckbox.Indicator
      indeterminate={indeterminate}
      asChild
    >
      <styled.svg
        ref={ref}
        viewBox="0 0 24 24"
        strokeWidth="3px"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ fill: "none", stroke: "currentColor" }}
        {...props}
      >
        <title>Checkmark</title>
        {indeterminate ? <path d="M5 12h14" /> : checked ? <path d="M20 6 9 17l-5-5" /> : null}
      </styled.svg>
    </ArkCheckbox.Indicator>
  );
};

export interface CheckboxProps extends RootProps {
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
      cursor="pointer"
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
