import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { TooltipIconButton } from "../Buttons";
import type { InputProps } from "./Input";
import { Input } from "./Input";
import { InputGroup, inputGroupButtonSizeFor } from "./InputGroup";

export type PasswordInputProps = Omit<InputProps, "type">;

export const PasswordInput = ({ size, className, style, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [styleProps, inputProps] = splitCssProps(props);

  return (
    <InputGroup
      size={size}
      className={className}
      style={style}
      {...styleProps}
      endElement={
        <TooltipIconButton
          label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((prev) => !prev)}
          size={inputGroupButtonSizeFor(size)}
          variant="plain"
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </TooltipIconButton>
      }
    >
      <Input
        size={size}
        {...inputProps}
        type={isVisible ? "text" : "password"}
      />
    </InputGroup>
  );
};
