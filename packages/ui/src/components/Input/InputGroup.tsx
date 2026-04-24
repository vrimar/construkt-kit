import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, type ReactNode } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { inputGroup } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(inputGroup);

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
