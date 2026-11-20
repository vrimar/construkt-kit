import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { radioGroup } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { HiddenInputControlProps, WithRef } from "../../types";
import {
  type RadioGroupRootOptions,
  type RadioItemOptions,
  type RadioValueChangeDetails,
  RadioGroupProvider,
  useRadioGroupRoot,
  useRadioItem,
} from "../radioGroup";

export type { RadioValueChangeDetails };

const { withProvider, withContext } = createSlotRecipeContext(radioGroup);

const StyledRoot = withProvider(renderable.div, "root");
const StyledItem = withContext(renderable.label, "item");
const StyledItemControl = withContext(renderable.div, "itemControl");
const StyledItemText = withContext(renderable.span, "itemText");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface RadioGroupProps
  extends Omit<StyledRootProps, keyof RadioGroupRootOptions>, RadioGroupRootOptions {}

function RadioGroup({
  ref,
  value,
  defaultValue,
  onValueChange,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  orientation,
  id,
  ...props
}: RadioGroupProps) {
  const { context, rootProps } = useRadioGroupRoot({
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    orientation,
    id,
  });
  const composedRef = useComposedRefs(rootProps.ref, ref);

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot
        {...rootProps}
        {...props}
        ref={composedRef}
      />
    </RadioGroupProvider>
  );
}

type ItemProps = ComponentProps<typeof StyledItem>;

export interface RadioProps
  extends
    Omit<ItemProps, "ref" | keyof RadioItemOptions>,
    RadioItemOptions,
    HiddenInputControlProps {}

export const Radio = ({
  ref,
  children,
  inputProps,
  rootRef,
  value,
  disabled,
  invalid,
  ...rest
}: WithRef<RadioProps, HTMLInputElement>) => {
  const {
    item,
    itemProps,
    inputProps: itemInputProps,
  } = useRadioItem({ value, disabled, invalid });

  return (
    <StyledItem
      ref={rootRef}
      {...mergeProps<ItemProps>(itemProps, rest)}
    >
      <renderable.input
        {...mergeProps<ComponentProps<typeof renderable.input>>(itemInputProps, inputProps)}
        ref={ref}
      />
      <StyledItemControl
        aria-hidden
        {...item.attributes}
      />
      {children != null && (
        <StyledItemText
          id={item.textId}
          {...item.attributes}
        >
          {children}
        </StyledItemText>
      )}
    </StyledItem>
  );
};

export { RadioGroup };
