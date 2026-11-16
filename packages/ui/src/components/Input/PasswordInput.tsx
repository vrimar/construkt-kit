import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { TooltipIconButton } from "../Buttons";
import type { InputProps } from "./Input";
import { inputGroupButtonSizeFor } from "./InputGroup";
import { InputGroupField } from "./InputGroupField";

export type PasswordInputProps = Omit<InputProps, "type">;

export const PasswordInput = ({ size, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroupField
      size={size}
      {...props}
      type={isVisible ? "text" : "password"}
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
    />
  );
};
