import { RadioGroup } from "@ark-ui/react/radio-group";
import type { ComponentProps, InputHTMLAttributes, Ref } from "react";
import { createStyleContext } from "styled-system/jsx";
import { radioGroup } from "styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(radioGroup);

type ItemProps = ComponentProps<typeof Item>;
const Root = withProvider(RadioGroup.Root, "root");
const Item = withContext(RadioGroup.Item, "item");
const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
const ItemText = withContext(RadioGroup.ItemText, "itemText");
const ItemHiddenInput = RadioGroup.ItemHiddenInput;

export interface RadioProps extends ItemProps {
  rootRef?: Ref<HTMLLabelElement>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export const Radio = ({
  ref,
  children,
  inputProps,
  rootRef,
  ...rest
}: WithRef<RadioProps, HTMLInputElement>) => {
  return (
    <Item
      ref={rootRef}
      {...rest}
    >
      <ItemHiddenInput
        ref={ref}
        {...inputProps}
      />
      <ItemControl cursor="pointer" />
      {children && <ItemText cursor="pointer">{children}</ItemText>}
    </Item>
  );
};

export { Root as RadioGroup };
