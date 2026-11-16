import type { ReactNode } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { Input, type InputProps } from "./Input";
import { InputGroup } from "./InputGroup";

export interface InputGroupFieldProps extends InputProps {
  startElement?: ReactNode;
  endElement?: ReactNode;
}

export function InputGroupField({
  size,
  className,
  style,
  startElement,
  endElement,
  ...props
}: InputGroupFieldProps) {
  const [styleProps, inputProps] = splitCssProps(props);

  return (
    <InputGroup
      size={size}
      className={className}
      style={style}
      {...styleProps}
      startElement={startElement}
      endElement={endElement}
    >
      <Input
        size={size}
        {...inputProps}
      />
    </InputGroup>
  );
}
