import { ark } from "@ark-ui/react/factory";
import { XIcon } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type InputGroupVariant, inputGroup } from "#styled-system/recipes";

import { type ButtonProps, IconButton, type IconButtonProps } from "../Buttons";
import type { InputProps } from "./Input";

const { withProvider, withContext } = createSlotRecipeContext(inputGroup);

export type InputGroupSize = NonNullable<InputGroupVariant["size"]>;

/** Button size that fits inside an input group's start/end element slot at each input size. */
export const inputGroupButtonSize: Record<InputGroupSize, ButtonProps["size"]> = {
  "2xs": "2xs",
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
  "2xl": "xl",
};

export const inputGroupButtonSizeFor = (size: InputProps["size"] = "md"): ButtonProps["size"] =>
  inputGroupButtonSize[size as InputGroupSize];

export interface InputGroupClearButtonProps extends Omit<IconButtonProps, "size" | "children"> {
  size?: InputProps["size"];
}

export const InputGroupClearButton = ({ size, ...props }: InputGroupClearButtonProps) => (
  <IconButton
    variant="plain"
    size={inputGroupButtonSizeFor(size)}
    {...props}
  >
    <XIcon />
  </IconButton>
);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ark.div, "root");
const Element = withContext(ark.div, "element");

export interface InputGroupProps extends RootProps {
  startElement?: ReactNode | undefined;
  endElement?: ReactNode | undefined;
}

export const InputGroup = ({
  ref,
  startElement,
  endElement,
  children,
  ...rest
}: InputGroupProps) => {
  return (
    <Root
      ref={ref}
      {...rest}
    >
      {startElement && (
        <Element
          insetInlineStart="0"
          top="0"
        >
          {startElement}
        </Element>
      )}
      {children}
      {endElement && (
        <Element
          insetInlineEnd="0"
          top="0"
        >
          {endElement}
        </Element>
      )}
    </Root>
  );
};
