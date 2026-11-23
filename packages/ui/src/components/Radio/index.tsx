import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { radioGroup } from "#styled-system/recipes";

import { mergeProps, renderable } from "../../primitives/render";
import type { HiddenInputControlProps, WithRef } from "../../types";
import {
  type RadioGroupRootOptions,
  type RadioItem,
  type RadioItemOptions,
  type RadioValueChangeDetails,
  RadioGroupProvider,
  RadioItemHiddenInput,
  RadioItemProvider,
  useRadioGroupRoot,
  useRadioItem,
  useRadioItemTextId,
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

function RadioGroup(props: RadioGroupProps) {
  const { context, rootProps } = useRadioGroupRoot(props);

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot {...rootProps} />
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
  const { item, itemProps } = useRadioItem({ value, disabled, invalid, id: rest.id });

  return (
    <RadioItemProvider value={item}>
      <StyledItem
        ref={rootRef}
        {...mergeProps<ItemProps>(itemProps, rest)}
      >
        <RadioItemHiddenInput
          {...inputProps}
          ref={ref}
        />
        <StyledItemControl
          aria-hidden
          {...item.attributes}
        />
        {children != null && <RadioText item={item}>{children}</RadioText>}
      </StyledItem>
    </RadioItemProvider>
  );
};

function RadioText({ item, children }: { item: RadioItem; children: ReactNode }) {
  return (
    <StyledItemText
      id={useRadioItemTextId(item)}
      {...item.attributes}
    >
      {children}
    </StyledItemText>
  );
}

export { RadioGroup };
