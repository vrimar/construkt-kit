import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { inputGroup } from "@construkt-kit/styled-system/recipes";
import { type ComponentProps, type ReactNode } from "react";

import type { WithRef } from "../../types";
import type { ButtonProps } from "../Buttons";

const { withProvider, withContext } = createStyleContext(inputGroup);

export type InputGroupSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

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
}: WithRef<InputGroupProps>) => {
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
