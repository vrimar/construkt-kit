import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { TooltipIconButton } from "../Buttons";
import type { InputProps } from "./Input";
import { Input } from "./Input";
import { InputGroup, type InputGroupProps, inputGroupButtonSizeFor } from "./InputGroup";

export interface PasswordInputProps extends InputProps {
  containerProps?: InputGroupProps;
}

export const PasswordInput = ({ containerProps, size, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup
      size={size}
      {...containerProps}
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
        type={isVisible ? "text" : "password"}
        {...props}
      />
    </InputGroup>
  );
};
